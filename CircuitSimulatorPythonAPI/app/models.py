from . import db

class RequestCircuit(db.Model):
    __tablename__ = 'circuits'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sim_type = db.Column(db.String(100), nullable=True)
    data = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f'<Circuit {self.name}>'
