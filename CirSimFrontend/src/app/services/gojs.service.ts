import { Injectable } from '@angular/core';
import * as go from 'gojs';

@Injectable({
  providedIn: 'root',
})
export class GojsService {
  public diagram!: go.Diagram;
  public palette!: go.Palette;

  constructor() {}

  public initDiagram(diagramDivId: string): go.Diagram {
    const $ = go.GraphObject.make;
    this.diagram = $(go.Diagram, diagramDivId, {
      'undoManager.isEnabled': true,
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
          corner: 3,
          relinkableFrom: true,
          relinkableTo: true,
          selectionAdorned: false,
          shadowOffset: new go.Point(0, 0),
          shadowBlur: 5,
        },
        new go.Binding('isShadowed', 'isSelected').ofObject(),
        $(go.Shape, { name: 'SHAPE', strokeWidth: 2, stroke: 'orangered' })
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
        { category: 'Resistor', value: '100Ω' },
        { category: 'Capacitor', value: '10µF' },
        { category: 'Inductor', value: '10mH' },
        { category: 'Diode', value: '1N4001' },
        { category: 'Transistor', value: '2N2222' },
        { category: 'Voltage Source', value: '5V' },
        { category: 'Current Source', value: '1A' },
        { category: 'Opamp', value: '741' },
        { category: 'Ground', value: '' },
      ]),
    });

    return this.palette;
  }

  // private createNodeTemplateMap(): go.Map<string, go.Node> {
  //   const $ = go.GraphObject.make;
  //   const nodeTemplateMap = new go.Map<string, go.Node>();

  //   function createNodeTemplate(category: string): go.Node {
  //     return $(
  //       go.Node,
  //       'Spot',
  //       {
  //         rotatable: true,
  //         resizable: false,
  //         deletable: true,
  //       },
  //       $(go.Shape, 'Rectangle', {
  //         fill: 'transparent',
  //         stroke: 'transparent',
  //         strokeWidth: 2,
  //       }),
  //       $(
  //         go.TextBlock,
  //         {
  //           alignment: go.Spot.Bottom,
  //           margin: 5,
  //           editable: true,
  //           angle: 0,
  //         },
  //         new go.Binding('text', 'value').makeTwoWay(),
  //         new go.Binding('angle', 'angle', function (ang) {
  //           return -ang;
  //         })
  //       ),
  //       ...getComponentPorts(category),
  //       getComponentShape(category)
  //     );
  //   }

  //   // Define specific component shapes
  //   function getComponentShape(category: string) {
  //     const $ = go.GraphObject.make;
  //     switch (category) {
  //       case 'Resistor':
  //         return $(go.Shape, {
  //           stroke: 'black',
  //           strokeWidth: 2,
  //           geometryString: 'M0 0 L20 20 M20 20 L40 0 M40 0 L60 20',
  //           alignment: go.Spot.Center,
  //           alignmentFocus: go.Spot.Center,
  //         });
  //       case 'Capacitor':
  //         return $(go.Shape, 'Rectangle', {
  //           fill: 'lightgray',
  //           strokeWidth: 2,
  //         });
  //       case 'Inductor':
  //         return $(go.Shape, 'Rectangle', {
  //           fill: 'transparent',
  //           stroke: 'black',
  //           strokeWidth: 2,
  //           geometryString: 'M0 0 C20 -30, 40 30, 60 0 C80 -30, 100 30, 120 0',
  //           alignment: go.Spot.Center,
  //         });
  //       case 'Diode':
  //         return $(go.Shape, 'Triangle', {
  //           fill: 'lightgray',
  //           stroke: 'black',
  //           strokeWidth: 2,
  //           angle: 90,
  //           width: 20,
  //           height: 40,
  //         });
  //       case 'Transistor':
  //         return $(go.Shape, 'Rectangle', {
  //           fill: 'lightgray',
  //           strokeWidth: 2,
  //         });
  //       case 'Voltage Source':
  //         return $(go.Shape, 'Circle', { width: 40, height: 40, fill: '#fff' });
  //       case 'Current Source':
  //         return $(go.Shape, 'Circle', { width: 40, height: 40, fill: '#fff' });
  //       case 'Opamp':
  //         return $(go.Shape, 'Rectangle', {
  //           fill: 'lightgray',
  //           strokeWidth: 2,
  //         });
  //       default:
  //         return $(go.Shape, 'Rectangle', {
  //           width: 50,
  //           height: 50,
  //           fill: '#fff',
  //         });
  //     }
  //   }

  //   function getComponentPorts(category: string) {
  //     const $ = go.GraphObject.make;
  //     let ports = [];
  //     if (['Voltage Source', 'Current Source', 'Opamp'].includes(category)) {
  //       ports.push(
  //         $(go.Shape, 'Circle', {
  //           portId: 'in',
  //           alignment: go.Spot.Top,
  //           fromSpot: go.Spot.Top,
  //           fromLinkable: true,
  //           toLinkable: true,
  //           cursor: 'pointer',
  //           fill: 'black',
  //           stroke: 'black',
  //           desiredSize: new go.Size(10, 10),
  //         })
  //       );
  //       ports.push(
  //         $(go.Shape, 'Circle', {
  //           portId: 'out',
  //           alignment: go.Spot.Bottom,
  //           toSpot: go.Spot.Bottom,
  //           fromLinkable: true,
  //           toLinkable: true,
  //           cursor: 'pointer',
  //           fill: 'black',
  //           stroke: 'black',
  //           desiredSize: new go.Size(10, 10),
  //         })
  //       );
  //     } else {
  //       ports.push(
  //         $(go.Shape, 'Circle', {
  //           portId: 'in',
  //           alignment: go.Spot.Left,
  //           fromSpot: go.Spot.Left,
  //           fromLinkable: true,
  //           toLinkable: true,
  //           cursor: 'pointer',
  //           fill: 'black',
  //           stroke: 'black',
  //           desiredSize: new go.Size(10, 10),
  //         })
  //       );
  //       ports.push(
  //         $(go.Shape, 'Circle', {
  //           portId: 'out',
  //           alignment: go.Spot.Right,
  //           toSpot: go.Spot.Right,
  //           fromLinkable: true,
  //           toLinkable: true,
  //           cursor: 'pointer',
  //           fill: 'black',
  //           stroke: 'black',
  //           desiredSize: new go.Size(10, 10),
  //         })
  //       );
  //     }
  //     return ports;
  //   }

  //   // Add templates for all categories
  //   [
  //     'Resistor',
  //     'Capacitor',
  //     'Inductor',
  //     'Diode',
  //     'Transistor',
  //     'Voltage Source',
  //     'Current Source',
  //     'Opamp',
  //   ].forEach((category) => {
  //     nodeTemplateMap.add(category, createNodeTemplate(category));
  //   });

  //   return nodeTemplateMap;
  // }

  private createNodeTemplateMap(): go.Map<string, go.Node> {
    const $ = go.GraphObject.make;
    const nodeTemplateMap = new go.Map<string, go.Node>();

    nodeTemplateMap.add('Resistor', this.createComponentTemplate('Resistor'));
    nodeTemplateMap.add('Capacitor', this.createComponentTemplate('Capacitor'));
    nodeTemplateMap.add('Inductor', this.createComponentTemplate('Inductor'));
    nodeTemplateMap.add('Diode', this.createComponentTemplate('Diode'));
    nodeTemplateMap.add(
      'Transistor',
      this.createComponentTemplate('Transistor')
    );
    nodeTemplateMap.add(
      'Voltage Source',
      this.createComponentTemplate('Voltage Source')
    );
    nodeTemplateMap.add(
      'Current Source',
      this.createComponentTemplate('Current Source')
    );
    nodeTemplateMap.add('Opamp', this.createComponentTemplate('Opamp'));
    nodeTemplateMap.add('Ground', this.createComponentTemplate('Ground'));

    return nodeTemplateMap;
  }

  private createComponentTemplate(type: string): go.Node {
    const $ = go.GraphObject.make;
    return $(
      go.Node,
      'Spot',
      {
        rotatable: true,
        resizable: false,
        deletable: true,
      },
      $(go.Shape, 'Rectangle', {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 2,
      }),
      $(
        go.TextBlock,
        {
          alignment: go.Spot.Bottom,
          margin: 5,
          editable: true,
          angle: 0,
        },
        new go.Binding('text', 'value').makeTwoWay(),
        new go.Binding('angle', 'angle', (ang) => -ang)
      ),
      ...this.getComponentPorts(type),
      this.getComponentShape(type)
    );
  }

  private getComponentShape(type: string): go.Shape {
    const $ = go.GraphObject.make;
    switch (type) {
      case 'Resistor':
        return $(go.Shape, {
          geometryString: 'M0 0 L20 20 M20 20 L40 0 M40 0 L60 20',
        });
      case 'Capacitor':
        return $(go.Shape, 'Rectangle');
      case 'Inductor':
        return $(go.Shape, {
          geometryString: 'M0 0 C20 -30, 40 30, 60 0 C80 -30, 100 30, 120 0',
        });
      case 'Diode':
        return $(go.Shape, 'Triangle', { width: 20, height: 40 });
      case 'Transistor':
        return $(go.Shape, 'Rectangle');
      case 'Voltage Source':
      case 'Current Source':
        return $(go.Shape, 'Circle', { width: 40, height: 40 });
      case 'Opamp':
        return $(go.Shape, 'Rectangle');
      case 'Ground':
        return $(go.Shape, 'Rectangle', {
          fill: 'black',
          width: 50,
          height: 20,
        });
      default:
        return $(go.Shape, 'Rectangle');
    }
  }

  private getComponentPorts(type: string): go.GraphObject[] {
    const $ = go.GraphObject.make;
    let ports = [];

    switch (type) {
      case 'Resistor':
      case 'Capacitor':
      case 'Inductor':
      case 'Diode':
        ports = [
          $(go.Shape, 'Circle', {
            portId: 'in',
            alignment: go.Spot.Left,
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
          $(go.Shape, 'Circle', {
            portId: 'out',
            alignment: go.Spot.Right,
            fromLinkable: false,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
        ];
        break;
      case 'Voltage Source':
      case 'Current Source':
        ports = [
          $(go.Shape, 'Circle', {
            portId: 'in',
            alignment: go.Spot.Top,
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
          $(go.Shape, 'Circle', {
            portId: 'out',
            alignment: go.Spot.Bottom,
            fromLinkable: false,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
        ];
        break;
      case 'Transistor':
        ports = [
          $(go.Shape, 'Circle', {
            portId: 'base',
            alignment: new go.Spot(0, 0.5),
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
          $(go.Shape, 'Circle', {
            portId: 'collector',
            alignment: go.Spot.Right,
            fromLinkable: false,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
          $(go.Shape, 'Circle', {
            portId: 'emitter',
            alignment: go.Spot.Bottom,
            fromLinkable: false,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
        ];
        break;
      case 'Opamp':
        ports = [
          $(go.Shape, 'Circle', {
            portId: 'in+',
            alignment: new go.Spot(0, 0.3),
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
          $(go.Shape, 'Circle', {
            portId: 'in-',
            alignment: new go.Spot(0, 0.7),
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
          $(go.Shape, 'Circle', {
            portId: 'out',
            alignment: go.Spot.Right,
            fromLinkable: false,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
        ];
        break;
      case 'Ground':
        ports = [
          $(go.Shape, 'Circle', {
            portId: 'ground',
            alignment: go.Spot.Bottom,
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
        ];
        break;
      default:
        ports = [
          $(go.Shape, 'Circle', {
            portId: 'in',
            alignment: go.Spot.Left,
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
          $(go.Shape, 'Circle', {
            portId: 'out',
            alignment: go.Spot.Right,
            fromLinkable: false,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'black',
            stroke: 'black',
            desiredSize: new go.Size(10, 10),
          }),
        ];
    }

    return ports;
  }
}
