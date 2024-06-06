from . import db
from .models import RequestCircuit
from .ahkab_simulation import simulate_with_ahkab
from .myhdl_simulation import simulate_with_myhdl
from .pyspice_simulation import simulate_with_pyspice

def simulate_circuit(data):
    sim_type = data.get('sim_type')
    circuit_data: RequestCircuit = data.get('circuit_data')

    if sim_type == 'pyspice':
        return simulate_with_pyspice(circuit_data)
    elif sim_type == 'myhdl':
        return simulate_with_myhdl(circuit_data)
    elif sim_type == 'ahkab':
        return simulate_with_ahkab(circuit_data)
    else:
        return {'error': 'Invalid simulation type specified'}

def save_circuit(data):
    try:
        name = data.get('name')
        circuit_data = data.get('data')
        if not name or not circuit_data:
            return {'status': 'error', 'message': 'Missing name or data for the circuit'}

        new_circuit = RequestCircuit(name=name, data=circuit_data) # type: ignore
        db.session.add(new_circuit)
        db.session.commit()
        return {'status': 'success', 'message': f'Circuit {new_circuit.name} saved successfully', 'id': new_circuit.id}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def load_circuit(circuit_id):
    try:
        circuit = RequestCircuit.query.get(circuit_id)
        if circuit:
            return {'status': 'success', 'data': {'id': circuit.id, 'name': circuit.name, 'data': circuit.data}}
        else:
            return {'status': 'error', 'message': 'Circuit not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

