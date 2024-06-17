class SimpleComponent:
    def __init__(self, from_node, to_node):
        self.from_node = from_node
        self.to_node = to_node

    def __repr__(self):
        return f"SimpleComponent(from_node={self.from_node}, to_node={self.to_node})"

def convert_to_simple_components(components, connections):
    component_dict = {comp.component_id: comp for comp in components}

    simple_components = []

    for conn in connections:
        from_component = component_dict[conn.from_component]
        to_component = component_dict[conn.to_component]
        simple_component = SimpleComponent(from_node=from_component.component_id, to_node=to_component.component_id)
        simple_components.append(simple_component)

    return simple_components