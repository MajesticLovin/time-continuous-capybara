import matplotlib.pyplot as plt
# from PySpice.Spice.Netlist import Circuit
# from PySpice.Unit import u_V, u_kOhm, u_uF, u_ms

# # Criar o circuito
# circuit = Circuit("Circuito RC Simples")
# V1 = circuit.V('1', 'n1', circuit.gnd, 5@u_V)
# R1 = circuit.R('1', 'n1', 'n2', 1@u_kOhm)
# C1 = circuit.C('1', 'n2', circuit.gnd, 1@u_uF)

# # Configurar a simulação transiente
# simulator = circuit.simulator(simulator='ngspice-shared',temperature=25, nominal_temperature=25)
# analysis = simulator.transient(step_time=1@u_ms, end_time=5@u_ms)

# # Plotar os resultados
# plt.figure(figsize=(10, 5))
# plt.plot(analysis.time, analysis['n2'], label='Tensão no Capacitor (V)')
# plt.title('Resposta Transiente do Circuito RC')
# plt.xlabel('Tempo [s]')
# plt.ylabel('Tensão [V]')
# plt.legend()
# plt.grid()
# plt.show()
import PySpice.Logging.Logging as Logging
logger = Logging.setup_logging()


from PySpice.Spice.Netlist import Circuit
from PySpice.Unit import *

circuit = Circuit('Resistor Bridge')

circuit.V('input', 1, circuit.gnd, 10@u_V)
circuit.R(1, 1, 2, 2@u_kΩ)
circuit.R(2, 1, 3, 1@u_kΩ)
circuit.R(3, 2, circuit.gnd, 1@u_kΩ)
circuit.R(4, 3, circuit.gnd, 2@u_kΩ)
circuit.R(5, 3, 2, 2@u_kΩ)

simulator = circuit.simulator(simulator='ngspice-subprocess', temperature=25, nominal_temperature=25)
analysis = simulator.operating_point()

for node in analysis.nodes.values():
    print('Node {}: {:4.1f} V'.format(str(node), float(node))) 
    
# Plotar os resultados
plt.use('TkAgg',force=True)
plt.figure(figsize=(10, 5))
plt.plot(analysis.time, analysis['n2'], label='Tensão no Capacitor (V)')
plt.title('Resposta Transiente do Circuito RC')
plt.xlabel('Tempo [s]')
plt.ylabel('Tensão [V]')
plt.legend()
plt.grid()
plt.show()