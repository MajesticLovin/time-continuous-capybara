from PySpice.Spice.Netlist import Circuit as PySpiceCircuit
# from PySpice.Unit import u_Ohm, u_F, u_H, u_V, u_A
import json

def simulate_with_pyspice(circuit_model):
    # Parsear os dados JSON do modelo de circuito
    circuit_data = json.loads(circuit_model.data)
    nodes = circuit_data['nodes']
    links = circuit_data['links']
    ac_params = circuit_data.get('ac_analysis', None)

    # Criar o circuito no PySpice
    circuit = PySpiceCircuit(circuit_model.name)

    # Adicionar componentes ao circuito
    for node in nodes:
        if node['type'] == 'resistor':
            circuit.R(node['id'], node['source'], node['target'], value=float(node['value']) )
        elif node['type'] == 'capacitor':
            circuit.C(node['id'], node['source'], node['target'], value=float(node['value']) )
        elif node['type'] == 'inductor':
            circuit.L(node['id'], node['source'], node['target'], value=float(node['value']) )
        elif node['type'] == 'vsource':
            if ac_params:
                circuit.SinusoidalVoltageSource(node['id'], node['source'], node['target'], amplitude=f"{node['value']} V")
            else:
                circuit.V(node['id'], node['source'], node['target'], value=float(node['value']) )
        elif node['type'] == 'isource':
            circuit.I(node['id'], node['source'], node['target'], value=float(node['value']) )

    # Configurar o simulador
    simulator = circuit.simulator(temperature=25, nominal_temperature=25)
    op_analysis = simulator.operating_point()
    dc_analysis = simulator.dc('V1', start=0, stop=10, step=0.1)
    ac_analysis = simulator.ac(start_frequency=1, stop_frequency=1, number_of_points=10,  variation='DEC')
    
    # Coletar e formatar resultados
    results = {
        'operating_point': {f"{node}": f"{op_analysis[node].v:.2f} V" for node in op_analysis.nodes.keys()}, # type: ignore
        'dc_scan': [{'voltage': f"{point['V1']:.2f}", 'current': f"{point['I(V1)']:.4f} A"} for point in dc_analysis], # type: ignore
        'ac_analysis': {f"{f:.2f} Hz": {n: "{:.2f} V".format(abs(v)) for n, v in voltages.items()}
                        for f, voltages in ac_analysis.v.items()} # type: ignore
    }

    return {'status': 'success', 'results': results}
