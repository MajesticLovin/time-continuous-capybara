from enum import Enum

class ComponentType(Enum):
    RESISTOR = 'resistor'
    CAPACITOR = 'capacitor'
    INDUCTOR = 'inductor'
    DIODE = 'diode'
    TRANSISTOR = 'transistor'
    VOLTAGE_SOURCE = 'voltage_source'
    CURRENT_SOURCE = 'current_source'
    OPAMP = 'opamp'
    
class Component:
    def __init__(self, component_id, type, value, additional_params=None):
        self.component_id = component_id
        self.type = ComponentType(type)
        self.value = value
        self.additional_params = additional_params if additional_params else {}

    def to_dict(self):
        return {
            'component_id': self.component_id,
            'type': self.type.value,
            'value': self.value,
            'additional_params': self.additional_params
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            component_id=data['component_id'],
            type=data.get('type', 'resistor'),
            value=data['value'],
            additional_params=data.get('additional_params', {})
        )
        
class Connection:
    def __init__(self, connection_id, from_component, to_component):
        self.connection_id = connection_id
        self.from_component = from_component
        self.to_component = to_component

    def to_dict(self):
        return {
            'connection_id': self.connection_id,
            'from_component': self.from_component,
            'to_component': self.to_component
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            connection_id=data['connection_id'],
            from_component=data['from_component'],
            to_component=data['to_component']
        )

class CircuitModel:
    def __init__(self, components, connections):
        self.components = [Component.from_dict(comp) for comp in components]
        self.connections = [Connection.from_dict(conn) for conn in connections]

    def to_dict(self):
        return {
            'components': [comp.to_dict() for comp in self.components],
            'connections': [conn.to_dict() for conn in self.connections],
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            components=data.get('components', []),
            connections=data.get('connections', [])
        )