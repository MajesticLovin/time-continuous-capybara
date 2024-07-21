class SimpleComponent:
    def __init__(self, component_id, type, connections):
        self.component_id = component_id
        self.type = type
        self.connections = connections or []
        
    def add_connection(self, connection):
        self.connections.append(connection)


    def __repr__(self):
        return f"SimpleComponent(component_id={self.component_id}, component_type={self.type}, connections={self.connections})"


def convert_to_simple_components(components, connections):
    component_dict = {comp.component_id: comp for comp in components}
    simple_components_dict = {}

    for conn in connections:
        from_component = component_dict.get(conn.from_component)
        to_component = component_dict.get(conn.to_component)

        if from_component and to_component:
            if from_component.component_id not in simple_components_dict:
                simple_components_dict[from_component.component_id] = SimpleComponent(
                    component_id=from_component.component_id,
                    type=from_component.type.value,
                    connections=[]
                )
            simple_components_dict[from_component.component_id].add_connection({
                'to_node': to_component.component_id,
                'from_port': conn.from_port,
                'to_port': conn.to_port
            })

            if to_component.component_id not in simple_components_dict:
                simple_components_dict[to_component.component_id] = SimpleComponent(
                    component_id=to_component.component_id,
                    type=to_component.type.value,
                    connections=[]
                )
            simple_components_dict[to_component.component_id].add_connection({
                'from_node': from_component.component_id,
                'from_port': conn.from_port,
                'to_port': conn.to_port
            })

    return list(simple_components_dict.values())

