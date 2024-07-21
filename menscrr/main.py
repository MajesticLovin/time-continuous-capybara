import ahkab
from ahkab import circuit, time_functions
import numpy as np
import matplotlib.pyplot as plt
from PySpice.Probe.Plot import plot
from PySpice.Spice.Netlist import Circuit
from PySpice.Unit import *
import time

def simulate_ahkab(circuit_type):
    circuito = None

    if circuit_type == 1:
        # Circuito RC simples
        circuito = circuit.Circuit('Circuito RC')
        circuito.add_vsource('V1', 'n1', circuito.gnd, dc_value=1)
        circuito.add_resistor('R1', 'n1', 'n2', value=1e3)
        circuito.add_capacitor('C1', 'n2', circuito.gnd, value=1e-6)
        trans = ahkab.new_tran(tstart=0, tstop=0.01, tstep=1e-5)
    elif circuit_type == 2:
        # Circuito RLC
        circuito = circuit.Circuit('Circuito RLC')
        circuito.add_vsource('V1', 'n1', circuito.gnd, dc_value=1)
        circuito.add_resistor('R1', 'n1', 'n2', value=1e3)
        circuito.add_inductor('L1', 'n2', 'n3', value=1e-3)
        circuito.add_capacitor('C1', 'n3', circuito.gnd, value=1e-6)
        trans = ahkab.new_tran(tstart=0, tstop=0.01, tstep=1e-5)
    elif circuit_type == 3:
        # Retificador de meio onda com diodo
        circuito = circuit.Circuit('Retificador de Meio Onda')
        circuito.add_vsource('V1', 'n1', circuito.gnd, ac_value=1, function='sin')
        circuito.add_resistor('R1', 'n1', 'n2', value=1e3)
        circuito.add_diode('D1', 'n2', 'n3', model='default')
        circuito.add_resistor('R2', 'n3', circuito.gnd, value=1e3)
        circuito.add_capacitor('C1', 'n3', circuito.gnd, value=1e-6)
        trans = ahkab.new_tran(tstart=0, tstop=0.01, tstep=1e-5)
    elif circuit_type == 4:
        # Circuito RL com fonte de corrente
        circuito = circuit.Circuit('Circuito RL')
        circuito.add_isource('I1', 'n1', circuito.gnd, dc_value=1)
        circuito.add_resistor('R1', 'n1', 'n2', value=1e3)
        circuito.add_inductor('L1', 'n2', circuito.gnd, value=1e-3)
        trans = ahkab.new_tran(tstart=0, tstop=0.01, tstep=1e-5)

    resultado = ahkab.run(circuito, trans)
    return resultado


def simulate_pyspice(circuit_type,backend):
    circuito = None

    if circuit_type == 1:
        # Circuito RC simples
        circuito = Circuit('Circuito RC')
        circuito.V(1, 'n1', circuito.gnd, 1 @ u_V)
        circuito.R(1, 'n1', 'n2', 1 @ u_kΩ)
        circuito.C(1, 'n2', circuito.gnd, 1 @ u_uF)
    elif circuit_type == 2:
        # Circuito RLC
        circuito = Circuit('Circuito RLC')
        circuito.V(1, 'n1', circuito.gnd, 1 @ u_V)
        circuito.R(1, 'n1', 'n2', 1 @ u_kΩ)
        circuito.L(1, 'n2', 'n3', 1 @ u_mH)
        circuito.C(1, 'n3', circuito.gnd, 1 @ u_uF)
    elif circuit_type == 3:
        # Retificador de meio onda com diodo
        circuito = Circuit('Retificador de Meio Onda')
        circuito.V(1, 'n1', circuito.gnd, 1 @ u_V)
        circuito.R(1, 'n1', 'n2', 1 @ u_kΩ)
        circuito.D(1, 'n2', 'n3')
        circuito.R(2, 'n3', circuito.gnd, 1 @ u_kΩ)
        circuito.C(1, 'n3', circuito.gnd, 1 @ u_uF)
    elif circuit_type == 4:
        # Circuito RL com fonte de corrente
        circuito = Circuit('Circuito RL')
        circuito.I(1, 'n1', circuito.gnd, 1 @ u_A)
        circuito.R(1, 'n1', 'n2', 1 @ u_kΩ)
        circuito.L(1, 'n2', circuito.gnd, 1 @ u_mH)

    simulacao = circuito.simulator(backend,temperature=25, nominal_temperature=25)
    if circuit_type in [1, 2, 3]:
        analise = simulacao.transient(step_time=1 @ u_us, end_time=10 @ u_ms)
        tempo = [float(t) for t in analise.time]
        tensao = [float(v) for v in analise['n2' if circuit_type == 1 else 'n3']]
        return tempo, tensao
    elif circuit_type == 4:
        analise = simulacao.dc(V1=slice(0, 1, .01))
        corrente = [float(i) for i in analise['n2']]
        return analise['V1'], corrente


def run_ahkab_simulation(circuit_type):
    resultado = simulate_ahkab(circuit_type)
    return resultado

def run_pyspice_simulation(circuit_type):
    resultado = simulate_pyspice(circuit_type)
    return resultado

def compare_simulations():
    circuit_types = [1, 2, 3, 4]
    circuit_names = ['Circuito RC', 'Circuito RLC', 'Retificador de Meio Onda', 'Circuito RL']
    
    for circuit_type in circuit_types:
        print(f"Simulando {circuit_names[circuit_type-1]}")

        # Ahkab
        start_time = time.time()
        t_ahkab, v_ahkab = simulate_ahkab(circuit_type)
        ahkab_time = time.time() - start_time
        
        # PySpice com Xyce
        start_time = time.time()
        t_xyce, v_xyce = simulate_pyspice(circuit_type, backend='xyce')
        xyce_time = time.time() - start_time
        
        # PySpice com NgSpice
        start_time = time.time()
        t_ngspice, v_ngspice = simulate_pyspice(circuit_type, backend='ngspice')
        ngspice_time = time.time() - start_time
        
        # Plotando os resultados
        plt.figure(figsize=(10, 6))
        plt.plot(t_ahkab, v_ahkab, label='Ahkab')
        plt.plot(t_xyce, v_xyce, label='PySpice com Xyce')
        plt.plot(t_ngspice, v_ngspice, label='PySpice com NgSpice')
        plt.xlabel('Tempo (s)' if circuit_type != 4 else 'Tensão (V)')
        plt.ylabel('Tensão (V)' if circuit_type != 4 else 'Corrente (A)')
        plt.title(circuit_names[circuit_type-1])
        plt.legend()
        plt.grid()
        plt.show()

if __name__ == "__main__":
    compare_simulations()

def compare_simulations(circuit_type):
    # Medição de tempo para Ahkab
    start_time = time.time()
    resultado_ahkab = run_ahkab_simulation(circuit_type)
    ahkab_time = time.time() - start_time

    # Medição de tempo para PySpice
    start_time = time.time()
    resultado_pyspice = run_pyspice_simulation(circuit_type)
    pyspice_time = time.time() - start_time

    print(f"Tempo de execução - Ahkab: {ahkab_time} segundos")
    print(f"Tempo de execução - PySpice: {pyspice_time} segundos")

    # Resultados
    if circuit_type == 1:
        print("Resultados - Circuito RC:")
        print("Ahkab - Tensão em n2:", resultado_ahkab['tran']['n2'])
        print("PySpice - Tensão em n2:", [float(v) for v in resultado_pyspice['n2']])
    elif circuit_type == 2:
        print("Resultados - Circuito RLC:")
        print("Ahkab - Tensão em n3:", resultado_ahkab['tran']['n3'])
        print("PySpice - Tensão em n3:", [float(v) for v in resultado_pyspice['n3']])
    elif circuit_type == 3:
        print("Resultados - Retificador de Meio Onda:")
        print("Ahkab - Tensão em n3:", resultado_ahkab['tran']['n3'])
        print("PySpice - Tensão em n3:", [float(v) for v in resultado_pyspice['n3']])
    elif circuit_type == 4:
        print("Resultados - Circuito RL:")
        print("Ahkab - Corrente em L1:", resultado_ahkab['tran']['I(L1)'])
        print("PySpice - Corrente em L1:", [float(i) for i in resultado_pyspice['I(L1)']])

if __name__ == "__main__":
    print("Comparação de Simulações")
    print("1: Circuito RC Simples")
    print("2: Circuito RLC")
    print("3: Retificador de Meio Onda com Diodo")
    print("4: Circuito RL com Fonte de Corrente")
    circuit_type = int(input("Escolha o tipo de circuito (1-4): "))

    compare_simulations(circuit_type)
