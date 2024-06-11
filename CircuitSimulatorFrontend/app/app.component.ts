import { CircuitService } from 'app/services/circuit.service';
import { Component } from '@angular/core';
import { SimulationService } from './services/simulation.service';
import { CircuitUtils } from './utils/circuit.util';
import { CircuitEditorComponent } from './components/circuit-editor/circuit-editor.component';
import { ToastService } from './services/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  SimulationRequest,
  SimulationType,
} from './models/simulation-request.model';
import { CircuitComponent, CircuitConnection } from './models/circuit.model';

enum LoadCircuitOption {
  API = 'api',
  File = 'file',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Circuit Simulator';
  showLoadCircuitModal = false;
  LoadCircuitOption = LoadCircuitOption;
  _loadCircuitOption: LoadCircuitOption | null = null;
  circuitId: string = '';
  circuitName: string = '';

  constructor(
    private simulationService: SimulationService,
    private circuitService: CircuitService,
    private toastService: ToastService,
    private spinnerService: NgxSpinnerService
  ) {}

  loadCircuitFromAPI(): void {
    this.spinnerService.show();
    this.simulationService.getCircuitById(this.circuitId).subscribe({
      next: (circuitData) => {
        this.spinnerService.hide();
        this.toastService.show('Circuit loaded successfully!');
        this.loadCircuitData(circuitData);
        this.showLoadCircuitModal = false;
      },
      error: () => {
        this.spinnerService.hide();
        this.toastService.show(
          'Failed to find a circuit with the provided ID.',
          'Error'
        );
      },
    });
  }

  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const json = JSON.parse(e.target.result);
        if (CircuitUtils.validateSimulationRequest(json)) {
          this.loadCircuitData(json);
          this.showLoadCircuitModal = false;
        } else {
          this.toastService.show('JSON format invalid!', 'Error');
        }
      };
      reader.readAsText(file);
    }
  }

  loadCircuitData(simulationData: SimulationRequest): void {
    this.circuitId = simulationData.id;
    this.circuitName = simulationData.name;

    let nodes: CircuitComponent[] = [];
    let links: CircuitConnection[] = [];

    nodes = simulationData.data.nodes;
    links = simulationData.data.links;

    simulationData.data.nodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        if (
          !links.some(
            (link) =>
              (link.source === node.id && link.target === connectionId) ||
              (link.target === node.id && link.source === connectionId)
          )
        ) {
          links.push(
            new CircuitConnection(
              CircuitUtils.generateGUID(),
              node.id,
              connectionId
            )
          );
        }
      });
    });

    this.circuitService.setSimulationSettings({
      acAnalysis: simulationData.ac_analysis,
      simType: simulationData.sim_type,
    });

    this.circuitService.setCircuitNodes(nodes);
    this.circuitService.setCircuitLinks(links);
  }

  onSave(): void {
    if (!this.circuitId) {
      this.circuitId = CircuitUtils.generateGUID();
    }

    const circuitData = this.prepareCircuitData();
    if (
      !circuitData.name ||
      !circuitData.sim_type ||
      circuitData.data.nodes.length === 0
    ) {
      this.toastService.show('Please fill in all required fields.', 'Error');
      return;
    }

    this.spinnerService.show();
    this.simulationService.saveCircuit(circuitData).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.toastService.show('Circuit saved successfully!');
      },
      error: () => {
        this.spinnerService.hide();
        this.toastService.show('Failed to save circuit!', 'Error');
      },
    });
  }

  onAnalyze(): void {
    let nodes = this.circuitService.getCircuitNodes().value;
    if (!CircuitUtils.isCircuitClosed(nodes)) {
      this.toastService.show(
        'The circuit must be closed to perform analysis!',
        'Error'
      );
      return;
    }

    const circuitData = this.prepareCircuitData();
    this.spinnerService.show();
    this.simulationService.sendCircuitForAnalysis(circuitData).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.toastService.show('Analysis made successfully!');
      },
      error: () => {
        this.spinnerService.hide();
        this.toastService.show('Failed to analyze circuit!', 'Error');
      },
    });
  }

  prepareCircuitData(): SimulationRequest {
    const simConfig = this.circuitService.getSimulationSettings().value;
    const nodes = this.circuitService.getCircuitNodes().value;
    const links = this.circuitService.getCircuitLinks().value;

    return {
      id: this.circuitId,
      name: this.circuitName,
      sim_type: simConfig.simType,
      ac_analysis: simConfig.acAnalysis,
      data: {
        nodes: nodes,
        links: links,
      },
    };
  }
}
