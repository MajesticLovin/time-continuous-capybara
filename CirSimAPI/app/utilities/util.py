class SimpleComponent:
    def __init__(self, component_id, component_type, connections):
        self.component_id = component_id
        self.component_type = component_type
        self.connections = connections  # Lista de dicionários com detalhes da conexão

    def __repr__(self):
        return f"SimpleComponent(component_id={self.component_id}, component_type={self.component_type}, connections={self.connections})"


def convert_to_simple_components(components, connections):
    component_dict = {comp.component_id: comp for comp in components}

    simple_components_dict = {}

    for conn in connections:
        from_component = component_dict[conn.from_component]
        to_component = component_dict[conn.to_component]
        
        # Adiciona conexão ao componente de origem
        if from_component.component_id not in simple_components_dict:
            simple_components_dict[from_component.component_id] = SimpleComponent(
                component_id=from_component.component_id,
                component_type=from_component.type,
                connections=[]
            )
        simple_components_dict[from_component.component_id].connections.append({
            'to_node': to_component.component_id,
            'from_port': conn.from_port,
            'to_port': conn.to_port
        })

        # Adiciona conexão ao componente de destino
        if to_component.component_id not in simple_components_dict:
            simple_components_dict[to_component.component_id] = SimpleComponent(
                component_id=to_component.component_id,
                component_type=to_component.type,
                connections=[]
            )
        simple_components_dict[to_component.component_id].connections.append({
            'from_node': from_component.component_id,
            'from_port': conn.from_port,
            'to_port': conn.to_port
        })

    return list(simple_components_dict.values())
