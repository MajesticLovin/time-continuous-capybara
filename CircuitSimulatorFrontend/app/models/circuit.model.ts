import { Node, Edge } from '@swimlane/ngx-graph';

export enum CircuitComponentType {
  Resistor = 'resistor',
  Inductor = 'inductor',
  Capacitor = 'capacitor',
  VoltageSource = 'voltageSource',
  CurrentSource = 'currentSource',
  Junction = 'junction',
}

const pathToAssets = './src/assets/';

export class CircuitComponent implements Node {
  id: string;
  label: string;
  type: CircuitComponentType;
  connections: string[] = [];
  value?: number;
  icon: string;

  constructor(
    id: string,
    type: CircuitComponentType,
    value?: number,
    label: string = ''
  ) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.label = label;
    this.icon = pathToAssets + this.selectIcon(type);
  }

  private selectIcon(type: CircuitComponentType): string {
    switch (type) {
      case CircuitComponentType.Resistor:
        return 'resistor.png';
      case CircuitComponentType.Capacitor:
        return 'capacitor.png';
      case CircuitComponentType.Inductor:
        return 'inductor.png';
      case CircuitComponentType.VoltageSource:
        return 'vsource.png';
      case CircuitComponentType.CurrentSource:
        return 'csource.png';
      case CircuitComponentType.Junction:
        return 'junction.png';
      default:
        return 'default.png';
    }
  }
}

export class CircuitConnection implements Edge {
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
