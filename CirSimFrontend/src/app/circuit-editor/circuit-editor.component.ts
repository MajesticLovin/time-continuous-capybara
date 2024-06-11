import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as go from 'gojs';
import { GojsService } from '../services/gojs.service';

@Component({
  selector: 'app-circuit-editor',
  templateUrl: './circuit-editor.component.html',
  styleUrls: ['./circuit-editor.component.scss'],
})
export class CircuitEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('diagramDiv')
  diagramDiv!: ElementRef;
  @ViewChild('paletteDiv')
  paletteDiv!: ElementRef;

  constructor(private gojsService: GojsService) {}

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
}
