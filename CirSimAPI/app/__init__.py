from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .controllers.simulation_controller import bp as simulation_bp

# Cria instâncias do aplicativo e extensões
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///circuitdb.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy()

def create_app():
    app.register_blueprint(simulation_bp, url_prefix='/api')
    CORS(app)
    
    db.init_app(app)

    from .controllers import simulation_controller
    app.register_blueprint(simulation_controller.bp)

    with app.app_context():
        db.create_all()

    return app
