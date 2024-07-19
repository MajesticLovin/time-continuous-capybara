import { Injectable } from '@angular/core';
import * as go from 'gojs';
import { UtilsService } from './utils.service';
import { CircuitModel } from '../models/circuit.model';

@Injectable({
  providedIn: 'root',
})
export class GojsService {
  public diagram!: go.Diagram;
  public palette!: go.Palette;

  constructor(private utils: UtilsService) {}

  public initDiagram(diagramDivId: string): go.Diagram {
    const $ = go.GraphObject.make;
    this.diagram = $(go.Diagram, diagramDivId, {
      'undoManager.isEnabled': true,
      'rotatingTool.snapAngleMultiple': 90,
      'rotatingTool.snapAngleEpsilon': 90,
      'draggingTool.dragsLink': true,
      'draggingTool.isGridSnapEnabled': true,
      model: new go.GraphLinksModel({
        linkKeyProperty: 'key',
        linkFromPortIdProperty: 'fromPort',
        linkToPortIdProperty: 'toPort',
      }),
      'grid.visible': true,
      linkTemplate: $(
        go.Link,
        {
          routing: go.Routing.AvoidsNodes,
          curve: go.Curve.JumpOver,
          corner: 10,
          relinkableFrom: true,
          relinkableTo: true,
          selectionAdorned: false,
          shadowOffset: new go.Point(5, 5),
          shadowBlur: 5,
        },
        new go.Binding('isShadowed', 'isSelected').ofObject(),
        $(go.Shape, { name: 'SHAPE', strokeWidth: 2 })
      ),
    });

    this.diagram.nodeTemplateMap = this.createNodeTemplateMap();

    this.diagram.addModelChangedListener(function (evt) {
      if (evt.isTransactionFinished) {
        console.log('Model Changed:', evt.model!.toJson());
      }
    });
    return this.diagram;
  }

  public initPalette(paletteDivId: string): go.Palette {
    const $ = go.GraphObject.make;
    this.palette = $(go.Palette, paletteDivId, {
      nodeTemplateMap: this.diagram.nodeTemplateMap,
      model: new go.GraphLinksModel([
        {
          category: 'Resistor',
          value: '100',
          notation: 'Ω',
        },
        {
          category: 'Capacitor',
          value: '10',
          notation: 'µF',
        },
        {
          category: 'Inductor',
          value: '10',
          notation: 'mH',
        },
        {
          category: 'Diode',
          value: '1N4001',
          notation: '',
        },
        {
          category: 'Voltage Source',
          value: '5',
          notation: 'V',
        },
        {
          category: 'Current Source',
          value: '1',
          notation: 'A',
        },
      ]),
    });

    return this.palette;
  }

  public nodeStyle() {
    const $ = go.GraphObject.make;
    return [
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      new go.Binding('isShadowed', 'isSelected').ofObject(),
      {
        rotatable: true,
        rotationSpot: go.Spot.Center,
        selectionAdorned: false,
        shadowOffset: new go.Point(0, 0),
        shadowBlur: 15,
        shadowColor: 'gray',
        toolTip: $(
          'ToolTip',
          { 'Border.figure': 'RoundedRectangle' },
          $(
            go.TextBlock,
            { margin: 2 },
            new go.Binding('text', '', (d) => d.category)
          )
        ),
      },
    ];
  }

  private createNodeTemplateMap(): go.Map<string, go.Node> {
    const $ = go.GraphObject.make;
    const nodeTemplateMap = new go.Map<string, go.Node>();
    var componentsList: { [key: string]: string } = {
      Resistor: 'resistor.svg',
      Capacitor: 'capacitor.svg',
      Inductor: 'inductor.svg',
      Diode: 'diode.svg',
      'Voltage Source': 'vsource.svg',
      'Current Source': 'isource.svg',
    };

    Object.keys(componentsList).forEach((key) => {
      nodeTemplateMap.add(key, this.getPortTemplate(true, componentsList[key]));
    });
    return nodeTemplateMap;
  }

  public getPortTemplate(horizontal: boolean, category: string) {
    const $ = go.GraphObject.make;

    var template = $(
      go.Node,
      'Spot',
      this.nodeStyle(),
      new go.Panel('Table').add(
        new go.Picture({
          source: 'assets/' + category,
          // column: 1,
          // row: 3,
          width: 100,
          height: 60,
          imageStretch: go.ImageStretch.Uniform,
          margin: new go.Margin(40, 0, 40, 0),
        })
      ),
      $(go.Shape, 'Circle', this.portStyle(true, horizontal), {
        portId: 'in',
        alignment: new go.Spot(0.04, 0.5),
      }),
      $(go.Shape, 'Circle', this.portStyle(false, horizontal), {
        portId: 'out',
        alignment: new go.Spot(0.96, 0.5),
      }),
      new go.Panel('Horizontal').add(
        $(
          go.TextBlock,
          {
            margin: 10,
            textAlign: 'center',
            font: 'bold 14px Segoe UI,sans-serif',
            stroke: '#484848',
            editable: true,
          },
          {
            margin: new go.Margin(60, 0, 0, 0),
          },
          new go.Binding('text', 'value').makeTwoWay()
        ),
        $(
          go.TextBlock,
          {
            margin: 10,
            textAlign: 'center',
            font: 'bold 14px Segoe UI,sans-serif',
            stroke: '#484848',
            editable: false,
          },
          {
            margin: new go.Margin(60, 0, 0, 0),
          },
          new go.Binding('text', 'notation')
        )
      )
    );
    return template;
  }

  public portStyle(input: any, horizontal: boolean) {
    return {
      desiredSize: new go.Size(6, 6),
      fill: 'black',
      fromSpot: horizontal ? go.Spot.Right : go.Spot.Bottom,
      fromLinkable: !input,
      toSpot: horizontal ? go.Spot.Left : go.Spot.Top,
      toLinkable: input,
      toMaxLinks: 1,
      cursor: 'pointer',
    };
  }

  public nodeShape(category: string) {
    var componentsSvgs: { [key: string]: string } = {
      Resistor: 'resistor.svg',
      Capacitor: 'capacitor.svg',
      Inductor: 'inductor.svg',
      Diode: 'diode.svg',
      'Voltage Source': 'vsource.svg',
      'Current Source': 'isource.svg',
    };

    return (
      go.Shape,
      {
        fill: '#231f20',
        stroke: '#231f20',
        strokeWidth: 2,
        desiredSize: new go.Size(100, 30),
        geometryString: this.utils.extractPathDFromSVGFile(
          'assets' + componentsSvgs[category]
        ),
      }
    );
  }
  public exportDiagram(): CircuitModel {
    return this.utils.graphLinksModeltoCircuitModel(this.diagram.model);
  }
}
