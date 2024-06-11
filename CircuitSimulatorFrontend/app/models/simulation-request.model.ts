import { CircuitComponent, CircuitConnection } from './circuit.model';

export enum SimulationType {
  PySpice = 'pyspice',
  MyHDL = 'myhdl',
  Ahkab = 'ahkab',
}

export interface CircuitData {
  nodes: CircuitComponent[];
  links: CircuitConnection[];
}

export interface SimulationRequest {
  id: string;
  name: string;
  sim_type: SimulationType;
  ac_analysis: boolean;
  data: CircuitData;
}
