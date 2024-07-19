from enum import Enum
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from .circuit import CircuitModel


class AnalysisType(Enum):
    DC = 'dc'
    AC = 'ac'
    TRANSIENT = 'transient'
    
    
class AnalyzerType(Enum):
    PYSPICE = 'pyspice'
    AHKAB = 'ahkab'
    
class PySpiceBackend(Enum):
    NGSPICE_SHARED = 'ngspice-shared'
    NGSPICE_SUBPROCESS = 'ngspice-subprocess'
    XYCE_SERIAL = 'xyce-serial'
    XYCE_PARALLEL = 'xyce-parallel'
    
db = SQLAlchemy()

class AdditionalParams(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    analysis_types = db.Column(db.JSON)
    pyspice_backend = db.Column(db.String(50))
    part_id = db.Column(db.String(50))
    analyzer_type = db.Column(db.String(50))
    pyspiceparams = db.Column(db.JSON)
    ahkadparams = db.Column(db.JSON)
    circuit_id = db.Column(db.String(255), db.ForeignKey('request.circuit_id'))
    
    def __repr__(self):
        return f'<AdditionalParams {self.id}>'
    
    def __init__(self, analysis_types, pyspice_backend, part_id, analyzer_type, pyspiceparams={}, ahkadparams={}):
        self.analysis_types = {AnalysisType[k]: v for k, v in analysis_types.items()}
        self.pyspice_backend = PySpiceBackend(pyspice_backend)
        self.part_id = part_id
        self.analyzer_type = AnalyzerType(analyzer_type)
        self.pyspiceparams = pyspiceparams
        self.ahkadparams = ahkadparams

    def to_dict(self):
        return {
            'analysis_types': {k.value: v for k, v in self.analysis_types.items()},
            'pyspice_backend': PySpiceBackend(self.pyspice_backend),
            'part_id': self.part_id,
            'analyzer_type': AnalyzerType(self.analyzer_type),
            'pyspiceparams': self.pyspiceparams,
            'ahkadparams': self.ahkadparams,
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            analysis_types={k: v for k, v in data.get('analysis_types', {'DC': True}).items()},
            pyspice_backend = PySpiceBackend(data['pyspice_backend']),
            part_id = data['part_id'],
            analyzer_type= AnalyzerType(data['analyzer_type']),
            pyspiceparams=data.get('pyspiceparams', {}),
            ahkadparams=data.get('ahkadparams', {})
        )

class Request(db.Model):
    
    circuit_id = db.Column(db.String(255), primary_key=True)
    circuit_name = db.Column(db.String(255), nullable=False)
    circuit_data = db.Column(db.JSON, nullable=False)
    additional_params = relationship("AdditionalParams", uselist=False, back_populates="request", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Circuit {self.circuit_name} {self.circuit_id}>'
    
    def __init__(self, circuit_name, circuit_id, circuit_data, additonal_params):
        self.circuit_id = circuit_id
        self.circuit_name = circuit_name
        self.circuit_data = CircuitModel.to_dict(circuit_data)
        self.additonal_params = AdditionalParams.to_dict(additonal_params)

    def to_dict(self):
        return {
            'circuit_id': self.circuit_id,
            'circuit_name': self.circuit_name,
            'circuit_data': CircuitModel.from_dict(self.circuit_data),
            'additonal_params': AdditionalParams.from_dict(self.additonal_params)
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            circuit_id=data['circuit_id'],
            circuit_name=data['circuit_name'],
            circuit_data=data['circuit_data'],
            additonal_params=data['additonal_params']
        )