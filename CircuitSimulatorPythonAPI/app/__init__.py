from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)  # Habilita CORS para todas as rotas
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///circuitdb.sqlite'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    from .routes import sim_blueprint
    app.register_blueprint(sim_blueprint)

    with app.app_context():
        db.create_all()  # Cria as tabelas se elas não existirem

    return app
