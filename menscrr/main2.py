import ahkab
from ahkab import circuit
import matplotlib.pyplot as plt
from PySpice.Doc.ExampleTools import find_libraries
from PySpice.Spice.Netlist import Circuit
from PySpice.Spice.Library import SpiceLibrary
from PySpice.Unit import *
import pandas as pd
import time
libraries_path = find_libraries()
spice_library = SpiceLibrary(libraries_path)

def simulate_ahkab_rc():
    circuito = circuit.Circuit('Circuito RC')
    circuito.add_vsource('V1', 'n1', circuito.gnd, dc_value=1)
    circuito.add_resistor('R1', 'n1', 'n2', value=1e3)
    circuito.add_capacitor('C1', 'n2', circuito.gnd, value=1e-6)
    print(circuito)
    trans = ahkab.new_tran(tstart=0, tstop=0.01, tstep=1e-5)
    resultado = ahkab.run(circuito, trans)
    if 'tran' in resultado:
        time = resultado['tran']['T']
        voltage_n2 = resultado['tran']['Vn2']  # Alteração feita aqui
        return time, voltage_n2
    else:
        raise KeyError("Nó 'n2' não encontrado nos resultados da simulação transiente do circuito RC com Ahkab")

def simulate_ahkab_rlc():
    circuito = circuit.Circuit('Circuito RLC')
    circuito.add_vsource('V1', 'n1', circuito.gnd, dc_value=1)
    circuito.add_resistor('R1', 'n1', 'n2', value=1e3)
    circuito.add_inductor('L1', 'n2', 'n3', value=1e-3)
    circuito.add_capacitor('C1', 'n3', circuito.gnd, value=1e-6)
    print(circuito)
    trans = ahkab.new_tran(tstart=0, tstop=0.01, tstep=1e-5)
    resultado = ahkab.run(circuito, trans)
    if 'tran' in resultado:
        time = resultado['tran']['T']
        voltage_n3 = resultado['tran']['Vn3']  # Alteração feita aqui
        return time, voltage_n3
    else:
        raise KeyError("Nó 'n3' não encontrado nos resultados da simulação transiente do circuito RLC com Ahkab")

def simulate_ahkab_rl():
    circuito = circuit.Circuit('Circuito RL')
    circuito.add_isource('I1', 'n1', circuito.gnd, dc_value=1)
    circuito.add_resistor('R1', 'n1', 'n2', value=1e3)
    circuito.add_inductor('L1', 'n2', circuito.gnd, value=1e-3)
    print(circuito)
    trans = ahkab.new_tran(tstart=0, tstop=0.01, tstep=1e-5)
    resultado = ahkab.run(circuito, trans)
    if 'tran' in resultado:
        time = resultado['tran']['T']
        voltage_n2 = resultado['tran']['Vn2']  # Alteração feita aqui
        return time, voltage_n2
    else:
        raise KeyError("Nó 'n2' não encontrado nos resultados da simulação DC do circuito RL com Ahkab")


def simulate_pyspice(circuit_type):
    circuito = None
    if circuit_type == 1:
        circuito = Circuit('Circuito RC')
        circuito.V(1, 'n1', circuito.gnd, 1 @ u_V)
        circuito.R(1, 'n1', 'n2', 1 @ u_kΩ)
        circuito.C(1, 'n2', circuito.gnd, 1 @ u_uF)
    elif circuit_type == 2:
        circuito = Circuit('Circuito RLC')
        circuito.V(1, 'n1', circuito.gnd, 1 @ u_V)
        circuito.R(1, 'n1', 'n2', 1 @ u_kΩ)
        circuito.L(1, 'n2', 'n3', 1 @ u_mH)
        circuito.C(1, 'n3', circuito.gnd, 1 @ u_uF)
    elif circuit_type == 3:
        circuito = Circuit('Circuito RL')
        circuito.I(1, 'n1', circuito.gnd, 1 @ u_A)
        circuito.R(1, 'n1', 'n2', 1 @ u_kΩ)
        circuito.L(1, 'n2', circuito.gnd, 1 @ u_mH)

    simulator = circuito.simulator( temperature=25, nominal_temperature=25)
        
    analise = simulator.transient(step_time=1 @ u_us, end_time=10 @ u_ms)
    print(analise)
    tempo = [float(t) for t in analise.time]
    tensao = [float(v) for v in analise['n2' if circuit_type == 1 else 'n3']]
    return tempo, tensao

def compare_simulations():
    circuit_types = [1, 2, 3]
    circuit_names = ['Circuito RC', 'Circuito RLC', 'Circuito RL']
    results = []

    for circuit_type in circuit_types:
        print(f"Simulando {circuit_names[circuit_type-1]}")

        # Ahkab
        start_time = time.time()
        if circuit_type == 1:
            t_ahkab, v_ahkab = simulate_ahkab_rc()
        elif circuit_type == 2:
            t_ahkab, v_ahkab = simulate_ahkab_rlc()
        elif circuit_type == 3:
            t_ahkab, v_ahkab = simulate_ahkab_rl()
        ahkab_time = time.time() - start_time

        # PySpice com Xyce
        start_time = time.time()
        t_pyspice, v_pyspice = simulate_pyspice(circuit_type)
        pyspice_time = time.time() - start_time

        # Guardar resultados para comparação
        results.append({
            'circuit': circuit_names[circuit_type-1],
            'ahkab_time': ahkab_time,
            'pyspice_time': pyspice_time,
            'ahkab_result': v_ahkab,
            'pyspice_result': v_pyspice,
            'time': t_ahkab 
        })

        # Plotando os resultados
        plt.figure(figsize=(10, 6))
        plt.plot(t_ahkab, v_ahkab, label='Ahkab')
        plt.plot(t_pyspice, v_pyspice, label='PySpice')
        plt.xlabel('Tempo (s)' if circuit_type != 3 else 'Tensão (V)')
        plt.ylabel('Tensão (V)' if circuit_type != 3 else 'Corrente (A)')
        plt.title(circuit_names[circuit_type-1])
        plt.legend()
        plt.grid()
        plt.show()

    # Criar DataFrame e salvar resultados em Excel
    df = pd.DataFrame(results)
    df.to_excel('simulation_results.xlsx', index=False)

if __name__ == "__main__":
    compare_simulations()