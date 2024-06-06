from myhdl import block, Signal, intbv, Simulation, delay, always_comb
import json

def simulate_with_myhdl(circuit_model):
    circuit_data = json.loads(circuit_model.data)
    nodes = circuit_data['nodes']
    links = circuit_data['links']
    
    # Criar sinais MyHDL para cada nó
    signals = {node['id']: Signal(intbv(0)[1:]) for node in nodes}  # Exemplo com sinais de 1 bit

    @block
    def create_myhdl_signals():

        # Lógica para cada componente, exemplo para um NOT gate
        @always_comb
        def logic():
            for link in links:
                source_signal = signals[link['source']]
                target_signal = signals[link['target']]
                # Implementar lógica baseada no tipo de componente
                if link['type'] == 'not':
                    target_signal.next = not source_signal

        return logic

    # Instanciar e simular
    inst = create_myhdl_signals()
    sim = Simulation(inst)
    sim.run(10)  # Executar por 10 unidades de tempo

    # Extrair e formatar os resultados (exemplo simplificado)
    results = [{'id': node['id'], 'state': int(signals[node['id']])} for node in nodes]

    return {'status': 'success', 'results': results}