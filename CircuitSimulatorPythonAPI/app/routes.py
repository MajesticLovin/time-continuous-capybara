from flask import Blueprint, request, jsonify
from CircuitSimulatorPythonAPI.app.models import Circuit
from .handle_simulation import simulate_circuit, load_circuit, save_circuit

sim_blueprint = Blueprint('sim', __name__)

@sim_blueprint.route('/simulate/<int:circuit_id>', methods=['GET'])
def simulate(circuit_id):
    circuit = Circuit.query.get(circuit_id)
    if not circuit:
        return jsonify({'status': 'error', 'message': 'Circuit not found'}), 404

    result = simulate_circuit(circuit)
    return jsonify(result)

@sim_blueprint.route('/circuit/save', methods=['POST'])
def save():
    data = request.json
    response = save_circuit(data)
    return jsonify(response)

@sim_blueprint.route('/circuit/load', methods=['GET'])
def load():
    circuit_id = request.args.get('id')
    circuit = load_circuit(circuit_id)
    return jsonify(circuit)
