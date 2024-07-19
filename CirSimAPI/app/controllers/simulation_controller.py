from flask import Blueprint, request, jsonify
from CirSimAPI.app.services.simulation_service import SimulationService
from CirSimAPI.app.models.request import Request
from CirSimAPI.app import db

bp = Blueprint('simulation', __name__)

@bp.route('/circuit/simulate', methods=['POST'])
def simulate_circuit():
    data = request.get_json()
    print(data)
    sim_service = SimulationService()
    circuit_data = data.get('circuit_data')
    additional_params = data.get('additional_params')
    
    try:
        results = sim_service.run_simulation(circuit_data=circuit_data, additional_params=additional_params)
        return jsonify({'status': 'success', 'data': results})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@bp.route('/circuit/save', methods=['POST'])
def save_circuit():
    data = request.get_json()
    try:
        circuit_id = data.get('circuit_id')
        if not circuit_id:
            return jsonify({'status': 'error', 'message': 'Circuit ID is required'}), 400
        
        circuit = Request.query.get(circuit_id)
        if circuit:
            # Atualiza o circuito existente
            circuit.circuit_name = data.get('circuit_name', circuit.circuit_name)
            circuit.circuit_data = data.get('circuit_data', circuit.circuit_data)
            circuit.additonal_params = data.get('additional_params', circuit.additonal_params)
            db.session.commit()
            return jsonify({'status': 'success', 'message': f'Circuit {circuit.circuit_name} updated successfully', 'id': circuit.circuit_id})
        else:
            # Cria um novo circuito
            new_circuit = Request.from_dict(data)
            db.session.add(new_circuit)
            db.session.commit()
            return jsonify({'status': 'success', 'message': f'Circuit {new_circuit.circuit_name} saved successfully', 'id': new_circuit.circuit_id})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@bp.route('/circuit/<int:circuit_id>', methods=['GET'])
def load_circuit(circuit_id):
    try:
        circuit = Request.query.get(circuit_id)
        if circuit:
            return jsonify({'status': 'success', 'data': circuit.to_dict()})
        else:
            return jsonify({'status': 'error', 'message': 'Circuit not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@bp.route('/circuit/delete/<int:circuit_id>', methods=['DELETE'])
def delete_circuit(circuit_id):
    try:
        circuit = Request.query.get(circuit_id)
        if circuit:
            db.session.delete(circuit)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Circuit deleted successfully'})
        else:
            return jsonify({'status': 'error', 'message': 'Circuit not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@bp.route('/circuits', methods=['GET'])
def list_circuits():
    try:
        circuits = Request.query.with_entities(Request.circuit_id, Request.circuit_name).all() # type: ignore
        return jsonify({'status': 'success', 'data': [{'circuit_id': c[0], 'circuit_name': c[1]} for c in circuits]})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
