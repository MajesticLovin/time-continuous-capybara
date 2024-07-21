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
    analisys_types = db.Column(db.JSON)
    pyspice_backend = db.Column(db.String(50))
    part_id = db.Column(db.String(50))
    analyzer_type = db.Column(db.String(50))
    pyspiceparams = db.Column(db.JSON)
    ahkabparams = db.Column(db.JSON)
    circuit_id = db.Column(db.String(255), db.ForeignKey('request.circuit_id'))
    request = db.relationship('Request', back_populates='additional_params')
    
    def __repr__(self):
        return f'<AdditionalParams {self.id}>'
    
    def __init__(self, analysis_types, pyspice_backend, part_id, analyzer_type, pyspiceparams={}, ahkabparams={}):
        if type(analysis_types) == dict:
            self.analysis_types = analysis_types
        else:
            self.analysis_types = {AnalysisType[key.upper()]: value for key, value in analysis_types.items() if isinstance(key, str) and key.upper() in AnalysisType._member_names_}
        
        if type(analyzer_type) == AnalyzerType:
            self.analyzer_type = analyzer_type
        else:
            self.analyzer_type = AnalyzerType[analyzer_type.upper()] if isinstance(analyzer_type, str) and analyzer_type.upper() in AnalyzerType._member_names_ else AnalyzerType.PYSPICE 

        self.pyspice_backend = pyspice_backend
        self.part_id = part_id
        self.pyspiceparams = pyspiceparams
        self.ahkabparams = ahkabparams

    def to_dict(self):
        return {
            'analysis_types': self.analysis_types,
            'pyspice_backend': self.pyspice_backend,
            'part_id': self.part_id,
            'analyzer_type': self.analyzer_type,
            'pyspiceparams': self.pyspiceparams,
            'ahkabparams': self.ahkabparams,
        }

    @classmethod
    def from_dict(cls, data):
        analysis_types_data = data.get('analysis_types', {'dc': True, 'ac': True, 'transient': True})
        pyspice_backend_str = data.get('pyspice_backend', 'ngspice-shared')
        analyzer_type_str = data.get('analyzer_type', 'pyspice')
        
        analysis_types = {AnalysisType[key.upper()]: value for key, value in analysis_types_data.items() if key.upper() in AnalysisType.__members__}
        analyzer_type = AnalyzerType[analyzer_type_str.upper()] if analyzer_type_str.upper() in AnalyzerType._member_names_ else AnalyzerType.PYSPICE   
        pyspice_backend = PySpiceBackend[pyspice_backend_str.upper()] if pyspice_backend_str.upper() in PySpiceBackend._member_names_ else PySpiceBackend.NGSPICE_SHARED  
        
        return cls(
            analysis_types=analysis_types,
            analyzer_type=analyzer_type,
            pyspice_backend=pyspice_backend,
            part_id=data.get('part_id', ''),
            pyspiceparams=data.get('pyspiceparams',{}),
            ahkabparams=data.get('ahkabparams', {})
        )
        
    #     @classmethod
    # def from_dict(cls, data: dict):
    #     print(data['analisys_types'])
    #     analysis_types_data = data['analisys_types'] if data['analisys_types'] != '' else {'dc': True}
    #     print('\n')
    #     print(analysis_types_data)
    #     print('\n')
    #     analysis_types = {AnalysisType[key.upper()]: value for key, value in analysis_types_data.items() if key.upper() in AnalysisType.__members__}
    #     analyzer_type_str = data['analyzer_type'] if data['analyzer_type'] != '' else 'DC'
    #     analyzer_type = AnalyzerType[analyzer_type_str.upper()] if analyzer_type_str.upper() in AnalyzerType._member_names_ else AnalyzerType.PYSPICE   
    #     pyspice_backend_str = data['pyspice_backend'] if data['pyspice_backend'] != '' else 'ngspice'
    #     pyspice_backend = PySpiceBackend[pyspice_backend_str.upper()] if pyspice_backend_str.upper() in PySpiceBackend._member_names_ else PySpiceBackend.NGSPICE_SHARED  

    #     return cls(
    #         analysis_types=analysis_types,
    #         analyzer_type=analyzer_type,
    #         pyspice_backend=pyspice_backend,
    #         part_id=data['part_id'],
    #         pyspiceparams=data['pyspiceparams'],
    #         ahkabparams=data['ahkabparams']
    #     )

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