import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SimulationType } from 'app/models/simulation-request.model';
import { CircuitComponent, CircuitConnection } from 'app/models/circuit.model';

export interface SimulationSettings {
  simType: SimulationType;
  acAnalysis: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CircuitService {
  private circuitNodes = new BehaviorSubject<CircuitComponent[]>([]);
  private circuitLinks = new BehaviorSubject<CircuitConnection[]>([]);

  private simulationSettings = new BehaviorSubject<SimulationSettings>({
    simType: SimulationType.PySpice,
    acAnalysis: false,
  });

  constructor() {}

  setCircuitNodes(nodes: CircuitComponent[]): void {
    this.circuitNodes.next(nodes);
  }

  getCircuitNodes(): BehaviorSubject<CircuitComponent[]> {
    return this.circuitNodes;
  }

  setCircuitLinks(links: CircuitConnection[]): void {
    this.circuitLinks.next(links);
  }

  getCircuitLinks(): BehaviorSubject<CircuitConnection[]> {
    return this.circuitLinks;
  }

  setSimulationSettings(settings: SimulationSettings): void {
    this.simulationSettings.next(settings);
  }

  getSimulationSettings(): BehaviorSubject<SimulationSettings> {
    return this.simulationSettings;
  }
}
