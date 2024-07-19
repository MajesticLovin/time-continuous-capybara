import { Component, ElementRef, ViewChild } from '@angular/core';
import { CircuitService } from './services/circuit.service';
import { UtilsService } from './services/utils.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  AdditionalParams,
  RequestModel,
  AnalyzerType,
  AnalysisType,
  PySpiceBackend,
} from './models/request.model';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { GojsService } from './services/gojs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('diagramDiv')
  diagramDiv!: ElementRef;
  @ViewChild('paletteDiv')
  paletteDiv!: ElementRef;

  circuitId: string = '';
  circuitName: string = '';
  fileContent: any;
  analyzerType: AnalyzerType = AnalyzerType.AHKAB;
  analysisTypes: Record<AnalysisType, boolean> = {
    [AnalysisType.DC]: true,
    [AnalysisType.AC]: false,
    [AnalysisType.TRANSIENT]: false,
  };
  pySpiceBackend: PySpiceBackend = PySpiceBackend.NGSPICE_SHARED;

  constructor(
    private circuitService: CircuitService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private utils: UtilsService,
    private gojsService: GojsService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.diagramDiv && this.diagramDiv.nativeElement) {
      this.gojsService.initDiagram(this.diagramDiv.nativeElement.id);
    } else {
      console.error('Diagram div not available');
    }
    if (this.paletteDiv && this.paletteDiv.nativeElement) {
      this.gojsService.initPalette(this.paletteDiv.nativeElement.id);
    } else {
      console.error('Palette div not available');
    }
  }

  loadCircuit() {
    this.spinner.show();
    this.circuitService.getCircuitById(this.circuitId).subscribe(
      (data: HttpResponse<RequestModel>) => {
        this.spinner.hide();
        this.toastr.success('Circuit loaded successfully', 'Success');
        console.log('Circuit loaded:', data);
        // Tratar os dados carregados
      },
      (error: HttpErrorResponse) => {
        this.spinner.hide();
        this.toastr.error('Failed to load circuit', 'Error');
        console.error('Error loading circuit:', error);
      }
    );
  }

  saveCircuit() {
    this.spinner.show();
    this.circuitService.saveCircuit(this.populateRequest()).subscribe(
      (response: HttpResponse<RequestModel>) => {
        this.spinner.hide();
        this.toastr.success('Circuit saved successfully', 'Success');
        console.log('Circuit saved:', response);
      },
      (error: HttpErrorResponse) => {
        this.spinner.hide();
        this.toastr.error('Failed to save circuit', 'Error');
        console.error('Error saving circuit:', error);
      }
    );
  }

  sendForAnalysis() {
    this.spinner.show();
    this.circuitService
      .sendCircuitForAnalysis(this.populateRequest())
      .subscribe(
        (response: HttpResponse<RequestModel>) => {
          // FIX RESPONSE TYPE TO BE ACCURATE TO ANSWER FROM SERVER
          this.spinner.hide();
          this.toastr.success(
            'Circuit sent for analysis successfully',
            'Success'
          );
          console.log('Analysis sent:', response);
        },
        (error: HttpErrorResponse) => {
          this.spinner.hide();
          this.toastr.error('Failed to send circuit for analysis', 'Error');
          console.error('Error sending analysis:', error);
        }
      );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          this.fileContent = JSON.parse(fileReader.result as string);
          this.validateJSON(this.fileContent);
        } catch (error) {
          this.toastr.error('Error parsing JSON', 'Error');
          console.error('Error parsing JSON:', error);
        }
      };
      fileReader.readAsText(file);
    }
  }

  validateJSON(data: RequestModel) {
    var circuit = data.circuit_data;
    const isValid =
      circuit.components &&
      circuit.connections.every(
        (node: any) => 'id' in node && 'type' in node
      ) &&
      circuit.connections &&
      circuit.connections.every(
        (link: any) => 'source' in link && 'target' in link
      );
    if (!isValid) {
      this.toastr.error('Invalid JSON structure', 'Error');
      console.error('Invalid JSON structure');
      return;
    }
    this.toastr.success('JSON is valid', 'Success');
    console.log('JSON is valid:', data);
  }

  populateRequest() {
    var requestModel = new RequestModel(
      this.circuitId,
      this.circuitName,
      this.gojsService.exportDiagram(),
      new AdditionalParams(
        this.analyzerType,
        this.analysisTypes,
        this.pySpiceBackend
      )
    );
    return requestModel;
  }
}
