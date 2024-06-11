import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
@Component({
  selector: 'app-results-console',
  templateUrl: './results-console.component.html',
  styleUrls: ['./results-console.component.scss']
})

export class ResultsConsoleComponent implements OnInit {
  @Input() simulationResults: any;

  constructor() { }

  ngOnInit(): void {
    // Função para desenhar gráficos com D3.js
    this.drawResults();
  }

  drawResults(): void {
    // Implementação do D3.js para desenhar gráficos baseado em simulationResults
  }
}
