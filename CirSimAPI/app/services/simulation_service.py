from CirSimAPI.app.models.circuit import CircuitModel, ComponentType
from CirSimAPI.app.models.request import AdditionalParams, AnalysisType, AnalyzerType
from CirSimAPI.app.utilities.util import convert_to_simple_components
from PySpice.Spice.Netlist import Circuit as PySpiceCircuit
from PySpice.Unit import * # type: ignore
from ahkab.circuit import Circuit as AhkabCircuit
from ahkab import new_dc, new_ac, new_tran, run

class SimulationService:  
    def run_simulation(self, circuit_data, additional_params):
        circuit_model = CircuitModel.from_dict(circuit_data)
        additional_params = AdditionalParams.from_dict(additional_params)
        
        if additional_params.analyzer_type == AnalyzerType.PYSPICE:
            return self.run_pyspice_simulation(circuit_model, additional_params)
        elif additional_params.analyzer_type == AnalyzerType.AHKAB:
            return self.run_ahkab_simulation(circuit_model, additional_params)
        else:
            raise ValueError("Unsupported simulation type")
        
    def run_pyspice_simulation(self, circuit_model: CircuitModel, additional_params: AdditionalParams):
        
        components = convert_to_simple_components(circuit_model.components, circuit_model.connections)
        circuit = PySpiceCircuit(title=f"{additional_params.pyspice_backend}")

        for component in components:
            for connection in component.connections:
                node1 = str(component.component_id)
                node2 = str(connection['to_node'])
                from_port = connection['from_port']
                to_port = connection['to_port']
                
                if component.component_type == ComponentType.RESISTOR:
                    circuit.R(component.component_id, node1, node2, component.value * 1@U_Ohm) # type: ignore
                elif component.component_type == ComponentType.CAPACITOR:
                    circuit.C(component.component_id, node1, node2, component.value * 1@u_F) # type: ignore
                elif component.component_type == ComponentType.INDUCTOR:
                    circuit.L(component.component_id, node1, node2, component.value * 1@u_H) # type: ignore
                elif component.component_type == ComponentType.DIODE:
                    circuit.D(component.component_id, node1, node2, model="default_diode_model")
                elif component.component_type == ComponentType.VOLTAGE_SOURCE:
                    circuit.V(component.component_id, node1, node2, component.value * 1@u_V) # type: ignore
                elif component.component_type == ComponentType.CURRENT_SOURCE:
                    circuit.I(component.component_id, node1, node2, component.value * 1@u_A) # type: ignore
        
        sim = additional_params.pyspice_backend
        results = {}
        
        for analysis_type, perform in additional_params.analisys_types.items():
            if perform:
                params = getattr(additional_params, "pyspiceparams", {})
                if analysis_type == AnalysisType.DC:
                    analysis = circuit.simulator(simulator=sim).dc(V1=slice(params.get('start', 0), params.get('stop', 5), params.get('step', 0.1)))
                    results['dc'] = {
                        'voltage': {node: float(v) for node, v in analysis.nodes.items()}, # type: ignore
                        'current': {f"I({source.name})": float(source.dc_value) for source in circuit.sources if source.dc_value}
                    }
                elif analysis_type == AnalysisType.AC:
                    analysis = circuit.simulator(simulator=sim).ac(start_frequency=params.get('start_frequency', 1@u.Hz), stop_frequency=params.get('stop_frequency', 1@u.kHz), number_of_points=params.get('number_of_points', 10)) # type: ignore
                    results['ac'] = {
                        'voltage': {node: float(v) for node, v in analysis.nodes.items()}, # type: ignore
                        'current': {f"I({source.name})": {f: float(i) for f, i in zip(analysis.frequency, source.ac.magnitude)} for source in circuit.sources} # type: ignore
                    }
                elif analysis_type == AnalysisType.TRANSIENT:
                    analysis = circuit.simulator(simulator=sim).transient(step_time=params.get('step_time', 1@u.ms), end_time=params.get('end_time', 10@u.ms)) # type: ignore
                    results['transient'] = {
                        'voltage': {node: list(v) for node, v in analysis.nodes.items()}, # type: ignore
                        'current': {f"I({source.name})": list(source.transient) for source in circuit.sources}
                    }

        return results

    def run_ahkab_simulation(self, circuit_model: CircuitModel, additional_params: AdditionalParams):
        print('made it to ahkab')
        params = additional_params.ahkabparams
        my_circuit = AhkabCircuit(title="Ahkab")
        components = convert_to_simple_components(circuit_model.components, circuit_model.connections)
        
        component_dict = {}

        def get_or_create_node(node_id, port_id):
            return f"{node_id}_{port_id}"
        
        # print(components)
        for component in components:
            print(component)
            for connection in component.connections:
                print(connection)
                node1 = get_or_create_node(component.component_id, connection.get('from_port'))
                node2 = get_or_create_node(connection.get('to_node', component.component_id), connection.get('to_port', 'in'))
                print(node1)
                print(node2)
                
                component_type_map = {
                    ComponentType.RESISTOR: my_circuit.add_resistor,
                    ComponentType.CAPACITOR: my_circuit.add_capacitor,
                    ComponentType.INDUCTOR: my_circuit.add_inductor,
                    ComponentType.VOLTAGE_SOURCE: my_circuit.add_vsource,
                    ComponentType.CURRENT_SOURCE: my_circuit.add_isource,
                    ComponentType.DIODE: my_circuit.add_diode
                }

                if component.type in component_type_map:
                    add_component_func = component_type_map[component.type]
                    add_component_func(component.component_id, n1=node1, n2=node2, value=component.value)
        
        print(my_circuit.nodes_dict)
        
        if not additional_params.part_id:
            sources = [x.component_id for x in components if x.type== "Voltage Source"]
            if len(sources) == 1:
                additional_params.part_id = sources[0]
            elif len(sources) > 1:
                raise ValueError("Multiple sources found, please specify part_id")
            else:
                raise ValueError("No source found for analysis")

        # Optamos por nao expor as configuracoes mais especificas da analise para simplificar o processo e a implementacao inicial
        

        results = {}
        for analysis_type, perform in additional_params.analisys_types.items():
            if perform:
                params = getattr(additional_params, f"ahkabparams", {})
                if analysis_type == AnalysisType.DC:
                    dc_analysis = new_dc(source=sources[0], start=params.get('startdc', 0), stop=params.get('stopdc', 5), points=params.get('pointsdc', 100), sweep_type='LIN')
                    result = run(my_circuit, an_list=[dc_analysis])
                    results['dc'] = {'voltage': result['dc']['v'], 'current': result['dc']['i']}
                elif analysis_type == AnalysisType.AC:
                    ac_analysis = new_ac(start=params.get('startac', 1e3), stop=params.get('stopac', 1e6), points=params.get('pointsac', 100))
                    result = run(my_circuit, an_list=[ac_analysis])
                    results['ac'] = {'voltage': result['ac']['v'], 'current': result['ac']['i']}
                elif analysis_type == AnalysisType.TRANSIENT:
                    tran_analysis = new_tran(tstart=params.get('tstart', 0), tstop=params.get('tstop', 1e-3), tstep=params.get('tstep', 1e-6))
                    result = run(my_circuit, an_list=[tran_analysis])
                    results['transient'] = {'voltage': result['tran']['v'], 'current': result['tran']['i']}

        return results
