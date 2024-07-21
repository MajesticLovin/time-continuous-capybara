from enum import Enum
class PortType(Enum):
    INPUT = 'input'
    OUTPUT = 'output'
class ComponentType(Enum):
    RESISTOR = 'resistor'
    CAPACITOR = 'capacitor'
    INDUCTOR = 'inductor'
    DIODE = 'diode'
    VOLTAGE_SOURCE = 'voltage_source'
    CURRENT_SOURCE = 'current_source'
    
class Port:
    def __init__(self, port_id: str, port_type: PortType):
        self.port_id = port_id
        self.port_type = port_type

    def to_dict(self):
        return {
            'port_id': self.port_id,
            'port_type': self.port_type.value
        }

    @classmethod
    def from_dict(cls, data):
        return cls(port_id=data['port_id'], port_type=PortType(data('port_type')))
    
class Component:
    def __init__(self, component_id, type, value, label, ports):
        self.component_id = component_id
        self.type = ComponentType(type)
        self.value = value
        self.label = label
        self.ports = {port_id: Port.from_dict(port) for port_id, port in ports.items()}
        
    def to_dict(self):
        return {
            'component_id': self.component_id,
            'type': self.type.value,
            'value': self.value,
            'label': self.label,
            'ports': {port_id: port.to_dict() for port_id, port in self.ports.items()}
        }
    @classmethod
    def from_dict(cls, data):
        try:
            component_type = ComponentType[data['type'].replace(' ', '_').upper()]
        except KeyError:
            raise ValueError(f"'{data['type']}' is not a valid ComponentType")

        return cls(
            component_id=data['component_id'],
            type=component_type,
            value=data['value'],
            label=data['label'],
            ports={port_id: Port.from_dict(port) for port_id, port in data.get('ports', {}).items()}
        )



        
class Connection:
    def __init__(self, connection_id, from_component, to_component, from_port, to_port):
        self.connection_id = connection_id
        self.from_component = from_component
        self.to_component = to_component
        self.from_port = from_port
        self.to_port = to_port
        
    def to_dict(self):
        return {
            'connection_id': self.connection_id,
            'from_component': self.from_component,
            'from_port': self.from_port,
            'to_component': self.to_component,
            'to_port': self.to_port
        }
        
    @classmethod
    def from_dict(cls, data):
        return cls(
            connection_id=data['connection_id'],
            from_component=data['from_component'],
            to_component=data['to_component'],
            from_port=data['from_port'],
            to_port=data['to_port']
        )

class CircuitModel:
    def __init__(self, components, connections):
        self.components = [Component.from_dict(comp) for comp in components]
        self.connections = [Connection.from_dict(conn) for conn in connections]

    @classmethod
    def from_dict(cls, data):
        return cls(
            components=data['components'],
            connections=data['connections']
        )

    def to_dict(self):
        return {
            'components': [component.to_dict() for component in self.components],
            'connections': [connection.to_dict() for connection in self.connections]
        }
