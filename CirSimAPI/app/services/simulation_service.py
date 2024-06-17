from CirSimAPI.app.models.circuit import CircuitModel, ComponentType
from CirSimAPI.app.models.request import AdditionalParams, AnalysisType
from CirSimAPI.app.utilities.util import convert_to_simple_components
from PySpice.Spice.Netlist import Circuit as PySpiceCircuit
from PySpice.Unit import u # type: ignore
from ahkab.circuit import Circuit as AhkabCircuit
from ahkab import new_dc, new_ac, new_tran, run

class SimulationService:  
    def run_simulation(self, circuit_data, additional_params):
        
        circuit_model = CircuitModel.from_dict(circuit_data)
        additional_params = AdditionalParams.from_dict(additional_params)
        
        if circuit_data['type'] == 'pyspice':
            return self.run_pyspice_simulation(circuit_model, additional_params)
        elif circuit_data['type'] == 'ahkab':
            return self.run_ahkab_simulation(circuit_model, additional_params)
        else:
            raise ValueError("Tipo de simulação não suportado")
        
    def run_pyspice_simulation(self, circuit_model: CircuitModel, additional_params: AdditionalParams):
        
        components = convert_to_simple_components(circuit_model.components, circuit_model.connections)
        circuit = PySpiceCircuit(title=f"{additional_params.backend}-{additional_params.mode}")
        
        for component in components:
            node1 = str(component.from_component)
            node2 = str(component.to_component)
            if component.type == ComponentType.RESISTOR:
                circuit.R(component.component_id, node1, node2, component.value * u.ohm)
            elif component.type == ComponentType.CAPACITOR:
                circuit.C(component.component_id, node1, node2, component.value * u.F)
            elif component.type == ComponentType.INDUCTOR:
                circuit.L(component.component_id, node1, node2, component.value * u.H)
            elif component.type == ComponentType.DIODE:
                circuit.D(component.component_id, node1, node2, model="default_diode_model")
            elif component.type == ComponentType.TRANSISTOR:
                circuit.Q(component.component_id, node1, node2, 'NC', model="default_transistor_model")
            elif component.type == ComponentType.VOLTAGE_SOURCE:
                circuit.V(component.component_id, node1, node2, component.value * u.V)
            elif component.type == ComponentType.CURRENT_SOURCE:
                circuit.I(component.component_id, node1, node2, component.value * u.A)
                
        # Nao foi adicionado a opcao de utilizar opamps para simplificar a implementacao inicial
        
        sim = f"{additional_params.backend}-{additional_params.mode}"
        results = {}
        
        for analysis_type, perform in additional_params.analysis_types.items():
            if perform:
                params = getattr(additional_params, "pyspiceparams", {})
                if analysis_type == AnalysisType.DC:
                    analysis = circuit.simulator(simulator=sim).dc(V1=slice(params.get('start', 0), params.get('stop', 5), params.get('step', 0.1)))
                    results['dc'] = {
                        'voltage': {node: float(v) for node, v in analysis.nodes.items()}, # type: ignore
                        'current': {f"I({source.name})": float(source.dc_value) for source in circuit.sources if source.dc_value}
                    }
                elif analysis_type == AnalysisType.AC:
                    analysis = circuit.simulator(simulator=sim).ac(start_frequency=params.get('start_frequency', 1@u.Hz), stop_frequency=params.get('stop_frequency', 1@u.kHz), number_of_points=params.get('number_of_points', 10))
                    results['ac'] = {
                        'voltage': {node: float(v) for node, v in analysis.nodes.items()}, # type: ignore
                        'current': {f"I({source.name})": {f: float(i) for f, i in zip(analysis.frequency, source.ac.magnitude)} for source in circuit.sources} # type: ignore
                    }
                elif analysis_type == AnalysisType.TRANSIENT:
                    analysis = circuit.simulator(simulator=sim).transient(step_time=params.get('step_time', 1@u.ms), end_time=params.get('end_time', 10@u.ms))
                    results['transient'] = {
                        'voltage': {node: list(v) for node, v in analysis.nodes.items()}, # type: ignore
                        'current': {f"I({source.name})": list(source.transient) for source in circuit.sources}
                    }

        return results

    def run_ahkab_simulation(self, circuit_model: CircuitModel, additional_params: AdditionalParams):
        
        params=additional_params.ahkadparams
        my_circuit = AhkabCircuit(title="Ahkab")
        components = convert_to_simple_components(circuit_model.components, circuit_model.connections)

        for component in components:
            node1 = str(component.from_component)
            node2 = str(component.to_component)
            
            if component.type == ComponentType.RESISTOR:
                my_circuit.add_resistor(component.component_id, n1=node1, n2=node2, value=component.value)
            elif component.type == ComponentType.CAPACITOR:
                my_circuit.add_capacitor(component.component_id, n1=node1, n2=node2, value=component.value)
            elif component.type == ComponentType.INDUCTOR:
                my_circuit.add_inductor(component.component_id, n1=node1, n2=node2, value=component.value)
            elif component.type == ComponentType.VOLTAGE_SOURCE:
                my_circuit.add_vsource(component.component_id, n1=node1, n2=node2, dc_value=component.value)
            elif component.type == ComponentType.CURRENT_SOURCE:
                my_circuit.add_isource(component.component_id, n1=node1, n2=node2, dc_value=component.value)

        if not additional_params.part_id:
            sources = [x.component_id for x in circuit_model.components if x.type is ComponentType.VOLTAGE_SOURCE]
            if len(sources) == 1:
                additional_params.part_id = sources[0]
            elif len(sources) > 1:
                raise ValueError("Multiple sources found, please specify part_id")
            else:
                raise ValueError("No source found for analysis")

        # Optamos por nao expor as configuracoes mais especificas da analise para simplificar o processo e a implementacao inicial

        results = {}
        for analysis_type, perform in additional_params.analysis_types.items():
            if perform:
                params = getattr(additional_params, f"ahkabparams", {})
                if analysis_type == AnalysisType.DC:
                    dc_analysis = new_dc(source=sources[0], start=params.get('start', 0), stop=params.get('stop', 5), points=params.get('points', 100), sweep_type='LIN')
                    result = run(my_circuit, an_list=[dc_analysis])
                    results['dc'] = {'voltage': result['dc']['v'], 'current': result['dc']['i']}
                elif analysis_type == AnalysisType.AC:
                    ac_analysis = new_ac(start=params.get('start', 1e3), stop=params.get('stop', 1e6), points=params.get('points', 100))
                    result = run(my_circuit, an_list=[ac_analysis])
                    results['ac'] = {'voltage': result['ac']['v'], 'current': result['ac']['i']}
                elif analysis_type == AnalysisType.TRANSIENT:
                    tran_analysis = new_tran(tstart=params.get('tstart', 0), tstop=params.get('tstop', 1e-3), tstep=params.get('tstep', 1e-6))
                    result = run(my_circuit, an_list=[tran_analysis])
                    results['transient'] = {'voltage': result['tran']['v'], 'current': result['tran']['i']}

        return results
