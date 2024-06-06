from . import db
from .models import RequestCircuit
from ahkab import circuit
import ahkab
import json


def simulate_with_ahkab(circuit_model: RequestCircuit):
    # Analisar os dados JSON do modelo
    circuit_data = json.loads(circuit_model.data)
    nodes = circuit_data['nodes']
    ac_params = circuit_data.get('ac_analysis', None)

    # Criar um circuito Ahkab
    cir = circuit.Circuit(title=circuit_model.name)
    
    # Adicionar componentes ao circuito
    for node in nodes:
        node_id = node['id']
        n1 = node['source']
        n2 = node['target']
        node_type = node['type']
        value = node.get('value', 1)

        if node_type == 'resistor':
            cir.add_resistor(node_id, n1, n2, value)
        elif node_type == 'capacitor':
            cir.add_capacitor(node_id, n1, n2, value)
        elif node_type == 'inductor':
            cir.add_inductor(node_id, n1, n2, value)
        elif node_type == 'vsource':
            cir.add_vsource(node_id, n1, n2, dc_value=value)
        elif node_type == 'isource':
            cir.add_isource(node_id, n1, n2, dc_value=value)
            
    # Mantido o funcionamento apenas dos componentes 
    # mais basicos devido a complexidade de utilizar o mesmo
    # estilo de dados para diversos tipos de analises

    # Configurar a análise DC (ponto de operação)
    op_point = ahkab.new_op()

    # Executar a simulação DC
    result = ahkab.run(cir, [op_point])

    # Formatar resultados de operação DC
    results = {'op': {n: str(v) for n, v in result['op'].results.items()}}

    # Adicionar informações do ponto de operação (.opinfo)
    if hasattr(result['op'], 'opinfo'):
        results['opinfo'] = {k: v for k, v in result['op'].opinfo.items()}

    # Configurar e executar uma análise AC, se solicitado
    if ac_params:
        ac_analysis = ahkab.new_ac(start=float(ac_params['start_freq']),
                                   stop=float(ac_params['stop_freq']),
                                   points=int(ac_params['points']),
                                   x0=ac_params['type'])
        r_ac = ahkab.run(cir, [ac_analysis])

        # Reformatar os resultados de AC
        results['ac'] = {
            f"{f:.2f} Hz": ", ".join(f"{n}: {abs(v):.2f} V" for n, v in voltages.items())
            for f, voltages in r_ac['ac'].results.v.items()
        }
        
    # Possivel implementacao de outros tipos de análise
    # - Periodic Steady State (PSS): .pss
    # - Pole-zero Analysis (PZ): .pz
    # - TRANsient (TRAN): .tran
    # - Symbolic: .symbolic 

    return {'status': 'success', 'results': results}