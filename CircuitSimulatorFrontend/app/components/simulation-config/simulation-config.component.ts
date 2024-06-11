import { Component, Output, EventEmitter } from '@angular/core';
import { SimulationType } from 'app/models/simulation-request.model'; // Ajuste o caminho conforme necessário
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-simulation-config',
  templateUrl: './simulation-config.component.html',
  styleUrls: ['./simulation-config.component.scss'],
})
export class SimulationConfigComponent {
  @Output() configChange = new EventEmitter<{
    simType: SimulationType;
    acAnalysis: boolean;
  }>();
  simType: SimulationType = SimulationType.PySpice;
  acAnalysis: boolean = false;
  update$ = new BehaviorSubject<{
    simType: SimulationType;
    acAnalysis: boolean;
  }>({ simType: this.simType, acAnalysis: this.acAnalysis });

  constructor() {}

  onChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement | null;
    if (selectElement && selectElement.value) {
      this.configChange.emit({
        simType: this.simType,
        acAnalysis: this.acAnalysis,
      });
    }
  }

  setConfig(simType: SimulationType, acAnalysis: boolean): void {
    this.simType = simType;
    this.acAnalysis = acAnalysis;
    this.update$.next({ simType: this.simType, acAnalysis: this.acAnalysis });
  }
}
