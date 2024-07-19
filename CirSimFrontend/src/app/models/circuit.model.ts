export enum ComponentType {
  RESISTOR = 'resistor',
  CAPACITOR = 'capacitor',
  INDUCTOR = 'inductor',
  DIODE = 'diode',
  TRANSISTOR = 'transistor',
  VOLTAGE_SOURCE = 'voltage_source',
  CURRENT_SOURCE = 'current_source',
  OPAMP = 'opamp',
  GROUND = 'ground'
}

export interface PortDetails {
  portType: 'input' | 'output';
  nodeId: string;
}

export class Component {
  component_id: string;
  type: ComponentType;
  value: string;
  loc: string;
  ports: Record<string, PortDetails>;

  constructor(
    component_id: string,
    type: ComponentType,
    value: string,
    loc: string,
    ports: Record<string, PortDetails>
  ) {
    this.component_id = component_id;
    this.type = type;
    this.value = value;
    this.loc = loc;
    this.ports = ports;
  }

  toDict(): any {
    return {
      component_id: this.component_id,
      type: this.type,
      value: this.value,
      label: this.loc,
      ports: this.ports,
    };
  }

  static fromDict(data: any): Component {
    return new Component(
      data.component_id,
      ComponentType[data.type as keyof typeof ComponentType] ||
        ComponentType.RESISTOR,
      data.value,
      data.label,
      data.ports
    );
  }
}

export class Connection {
  connection_id: string;
  from_component: string;
  from_port: string;
  to_component: string;
  to_port: string;

  constructor(
    connection_id: string,
    from_component: string,
    from_port: string,
    to_component: string,
    to_port: string
  ) {
    this.connection_id = connection_id;
    this.from_component = from_component;
    this.from_port = from_port;
    this.to_component = to_component;
    this.to_port = to_port;
  }

  toDict(): any {
    return {
      connection_id: this.connection_id,
      from_component: this.from_component,
      from_port: this.from_port,
      to_component: this.to_component,
      to_port: this.to_port,
    };
  }

  static fromDict(data: any): Connection {
    return new Connection(
      data.connection_id,
      data.from_component,
      data.from_port,
      data.to_component,
      data.to_port
    );
  }
}

export class CircuitModel {
  components: Component[];
  connections: Connection[];

  constructor(components: Component[], connections: Connection[]) {
    this.components = components;
    this.connections = connections;
  }

  toDict(): any {
    return {
      components: this.components.map((comp) => comp.toDict()),
      connections: this.connections.map((conn) => conn.toDict()),
    };
  }

  static fromDict(data: any): CircuitModel {
    return new CircuitModel(
      data.components.map((comp: any) => Component.fromDict(comp)),
      data.connections.map((conn: any) => Connection.fromDict(conn))
    );
  }
}
