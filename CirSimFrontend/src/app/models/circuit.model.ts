export enum ComponentType {
  Resistor = 'resistor',
  Inductor = 'inductor',
  Capacitor = 'capacitor',
  VoltageSource = 'voltageSource',
  CurrentSource = 'currentSource',
  Junction = 'junction',
}

export enum SimulationType {
  PySpice = 'pyspice',
  MyHDL = 'myhdl',
  Ahkab = 'ahkab',
}

const pathToAssets = './../../assets/';

export class Node {
  id: string;
  label: string;
  type: ComponentType;
  value: number;
  icon: string;
  source?: string;
  target?: string;

  constructor(
    id: string,
    type: ComponentType,
    value: number,
    label: string = '',
    source?: string,
    target?: string
  ) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.label = label;
    this.source = source;
    this.target = target;
    this.icon = pathToAssets + this.selectIcon(type);
  }

  private selectIcon(type: ComponentType): string {
    switch (type) {
      case ComponentType.Resistor:
        return 'resistor.png';
      case ComponentType.Capacitor:
        return 'capacitor.png';
      case ComponentType.Inductor:
        return 'inductor.png';
      case ComponentType.VoltageSource:
        return 'vsource.png';
      case ComponentType.CurrentSource:
        return 'csource.png';
      case ComponentType.Junction:
        return 'junction.png';
      default:
        return 'default.png';
    }
  }
}

export class Link {
  id: string;
  source: string;
  target: string;
  label?: string;
  active?: boolean = true;

  constructor(id: string, source: string, target: string, label?: string) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.label = label;
  }
}

export interface CircuitData {
  nodes: Node[];
  links: Link[];
}

export interface SimulationRequest {
  id: string;
  name: string;
  sim_type: SimulationType;
  ac_analysis: boolean;
  data: CircuitData;
}
