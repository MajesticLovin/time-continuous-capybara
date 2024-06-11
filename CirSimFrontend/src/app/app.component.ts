import { Component } from '@angular/core';
import { CircuitService } from './services/circuit.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  circuitId: string = '';
  fileContent: any;

  constructor(
    private circuitService: CircuitService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  loadCircuit() {
    this.spinner.show();
    this.circuitService.getCircuitById(this.circuitId).subscribe(
      (data) => {
        this.spinner.hide();
        this.toastr.success('Circuit loaded successfully', 'Success');
        console.log('Circuit loaded:', data);
        // Tratar os dados carregados
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error('Failed to load circuit', 'Error');
        console.error('Error loading circuit:', error);
      }
    );
  }

  saveCircuit() {
    this.spinner.show();
    this.circuitService.saveCircuit(this.fileContent).subscribe(
      (response) => {
        this.spinner.hide();
        this.toastr.success('Circuit saved successfully', 'Success');
        console.log('Circuit saved:', response);
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error('Failed to save circuit', 'Error');
        console.error('Error saving circuit:', error);
      }
    );
  }

  sendForAnalysis() {
    this.spinner.show();
    this.circuitService.sendCircuitForAnalysis(this.fileContent).subscribe(
      (response) => {
        this.spinner.hide();
        this.toastr.success(
          'Circuit sent for analysis successfully',
          'Success'
        );
        console.log('Analysis sent:', response);
      },
      (error) => {
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

  validateJSON(data: any) {
    //   const hasBasicProps =
    //     typeof json.id === 'string' &&
    //     typeof json.name === 'string' &&
    //     Object.values(SimulationType).includes(json.sim_type) &&
    //     typeof json.ac_analysis === 'boolean';

    //   if (!hasBasicProps) return false;

    const isValid =
      data.nodes &&
      data.nodes.every((node: any) => 'id' in node && 'type' in node) &&
      data.links &&
      data.links.every((link: any) => 'source' in link && 'target' in link);
    if (!isValid) {
      this.toastr.error('Invalid JSON structure', 'Error');
      console.error('Invalid JSON structure');
      return;
    }
    this.toastr.success('JSON is valid', 'Success');
    console.log('JSON is valid:', data);
  }
}
