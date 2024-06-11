// gojs.service.ts
import { Injectable } from '@angular/core';
import * as go from 'gojs';

@Injectable({
  providedIn: 'root',
})
export class GojsService {
  public diagram!: go.Diagram;
  public palette!: go.Palette;

  constructor() {}

  // Inicializar o diagrama
  public initDiagram(diagramDivId: string): go.Diagram {
    const $ = go.GraphObject.make;
    this.diagram = $(go.Diagram, diagramDivId, {
      'undoManager.isEnabled': true,
      model: new go.GraphLinksModel({ linkKeyProperty: 'key' }),
    });

    this.diagram.nodeTemplateMap = this.createNodeTemplateMap();
    return this.diagram;
  }

  // Inicializar a paleta
  public initPalette(paletteDivId: string): go.Palette {
    const $ = go.GraphObject.make;
    this.palette = $(go.Palette, paletteDivId, {
      nodeTemplateMap: this.diagram.nodeTemplateMap,
    });

    this.palette.model = new go.GraphLinksModel([
      { category: 'Resistor' },
      // Adicione outros tipos conforme necessário
    ]);
    return this.palette;
  }

  // Criar mapas de template de nó
  private createNodeTemplateMap(): go.Map<string, go.Node> {
    const $ = go.GraphObject.make;
    const nodeTemplateMap = new go.Map<string, go.Node>();

    nodeTemplateMap.add(
      'Resistor',
      $(
        go.Node,
        'Spot',
        this.nodeStyle(),
        $(go.Shape, 'Rectangle', { width: 70, height: 20, fill: '#fff' }),
        $(go.Shape, 'Ellipse', this.portStyle(true, go.Spot.Left, false), {
          portId: 'in',
          alignment: new go.Spot(0, 0.5),
        }),
        $(go.Shape, 'Ellipse', this.portStyle(false, go.Spot.Right, true), {
          portId: 'out',
          alignment: new go.Spot(1, 0.5),
        }),
        $(
          go.TextBlock,
          { margin: 8, editable: true },
          new go.Binding('text', 'value').makeTwoWay()
        )
      )
    );

    // Adicione mais templates aqui

    return nodeTemplateMap;
  }

  private nodeStyle(): Object {
    return {
      // Definições de estilo básico
    };
  }

  private portStyle(input: boolean, spot: go.Spot, output: boolean) {
    return {
      desiredSize: new go.Size(6, 6),
      fill: 'black',
      fromSpot: spot,
      toSpot: spot,
      fromLinkable: output,
      toLinkable: input,
      fromMaxLinks: 1,
      toMaxLinks: 1,
    };
  }
}
