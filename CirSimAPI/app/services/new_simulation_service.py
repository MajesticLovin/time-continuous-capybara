from flask import jsonify
from CirSimAPI.app.models.circuit import CircuitModel, ComponentType
from CirSimAPI.app.models.request import AdditionalParams, AnalysisType
from CirSimAPI.app.utilities.util import convert_to_simple_components
from PySpice.Spice.Netlist import Circuit as PySpiceCircuit
from PySpice.Unit import u # type: ignore
from ahkab import new_dc, new_ac, new_tran, run
from ahkab.circuit import Circuit

class SimulationService:
    def run_simulation(self, circuit_data, additional_params):
        circuit_model = CircuitModel.from_dict(circuit_data)
        additional_params = AdditionalParams.from_dict(additional_params)
        
        if circuit_data['type'] == 'pyspice':
            return self.run_pyspice_simulation(circuit_model, additional_params)
        elif circuit_data['type'] == 'ahkab':
            return self.run_ahkab_simulation(circuit_model, additional_params)
        else:
            raise ValueError("Unsupported simulation type")
        
    def run_pyspice_simulation(self, circuit_model: CircuitModel, additional_params: AdditionalParams):
        circuit = PySpiceCircuit(title=f"{additional_params.backend}-{additional_params.mode}")
        self._setup_components(circuit, circuit_model, 'pyspice')
        results = self._perform_simulations(circuit, additional_params, 'pyspice')
        return results

    def run_ahkab_simulation(self, circuit_model: CircuitModel, additional_params: AdditionalParams):
        my_circuit = Circuit(title="Ahkab Simulation")
        self._setup_components(my_circuit, circuit_model, 'ahkab')
        results = self._perform_simulations(my_circuit, additional_params, 'ahkab')
        return results

    def _setup_components(self, circuit, circuit_model, sim_type):
        components = convert_to_simple_components(circuit_model.components, circuit_model.connections)
        for component in components:
            node1, node2 = str(component.from_component), str(component.to_component)
            value = component.value
            
            if sim_type == 'pyspice':
                if component.type == ComponentType.RESISTOR:
                    circuit.R(component.component_id, node1, node2, value * u.ohm)
                elif component.type == ComponentType.CAPACITOR:
                    circuit.C(component.component_id, node1, node2, value * u.F)
                elif component.type == ComponentType.INDUCTOR:
                    circuit.L(component.component_id, node1, node2, value * u.H)
                elif component.type == ComponentType.DIODE:
                    circuit.D(component.component_id, node1, node2, model="default_diode_model")
                elif component.type == ComponentType.TRANSISTOR:
                    circuit.Q(component.component_id, node1, node2, 'NC', model="default_transistor_model")
                elif component.type == ComponentType.VOLTAGE_SOURCE:
                    circuit.V(component.component_id, node1, node2, value * u.V)
                elif component.type == ComponentType.CURRENT_SOURCE:
                    circuit.I(component.component_id, node1, node2, value * u.A)
                    
            elif sim_type == 'ahkab':
                if component.type == ComponentType.RESISTOR:
                    circuit.add_resistor(component.component_id, n1=node1, n2=node2, value=value)
                elif component.type == ComponentType.CAPACITOR:
                    circuit.add_capacitor(component.component_id, n1=node1, n2=node2, value=value)
                elif component.type == ComponentType.INDUCTOR:
                    circuit.add_inductor(component.component_id, n1=node1, n2=node2, value=value)
                elif component.type == ComponentType.VOLTAGE_SOURCE:
                    circuit.add_vsource(component.component_id, n1=node1, n2=node2, dc_value=value)
                elif component.type == ComponentType.CURRENT_SOURCE:
                    circuit.add_isource(component.component_id, n1=node1, n2=node2, dc_value=value)


    def _perform_simulations(self, circuit, params, sim_type):
        results = {}
        for analysis_type, perform in params.analysis_types.items():
            if perform:
                specific_params = getattr(params, f"{sim_type}params", {})
                if analysis_type == AnalysisType.DC:
                    results['dc'] = self._run_dc_analysis(circuit, specific_params)
                elif analysis_type == AnalysisType.AC:
                    results['ac'] = self._run_ac_analysis(circuit, specific_params)
                elif analysis_type == AnalysisType.TRANSIENT:
                    results['transient'] = self._run_transient_analysis(circuit, specific_params)
        return results

    def _run_dc_analysis(self, circuit, params):
        analysis = circuit.simulator().dc(V1=slice(params.get('start', 0), params.get('stop', 5), params.get('step', 0.1)))
        return {'voltage': {node: float(v) for node, v in analysis.nodes.items()}} 

    def _run_ac_analysis(self, circuit, params):
        analysis = circuit.simulator().ac(start_frequency=params.get('start_frequency', 1@u.Hz), stop_frequency=params.get('stop_frequency', 1@u.kHz), number_of_points=params.get('number_of_points', 10))
        return {'voltage': {node: float(v) for node, v in analysis.nodes.items()}}

    def _run_transient_analysis(self, circuit, params):
        analysis = circuit.simulator().transient(step_time=params.get('step_time', 1@u.ms), end_time=params.get('end_time', 10@u.ms))
        return {'voltage': {node: list(v) for node, v in analysis.nodes.items()}}
