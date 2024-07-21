from flask import Flask
from CirSimAPI.app.database import db
from flask_cors import CORS
from CirSimAPI.app.controllers.simulation_controller import bp as simulation_bp    
from CirSimAPI.app.controllers import simulation_controller

# Cria instâncias do aplicativo e extensões
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///circuitdb.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

def create_app():
    app.register_blueprint(simulation_bp, url_prefix='/api')
    CORS(app, supports_credentials=True)
    
    db.init_app(app)

    with app.app_context():
        db.create_all()

    return app