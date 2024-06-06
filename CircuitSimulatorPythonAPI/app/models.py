from . import db

class RequestCircuit(db.Model):
    __tablename__ = 'circuits'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    data = db.Column(db.Text, nullable=False)  # Este campo armazenará os dados do circuito em formato JSON ou texto.

    def __repr__(self):
        return f'<Circuit {self.name}>'
