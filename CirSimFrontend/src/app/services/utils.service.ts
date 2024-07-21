import { Injectable } from '@angular/core';
import * as fs from 'fs';
import {
  CircuitModel,
  Component,
  ComponentType,
  Connection,
  PortDetails,
} from '../models/circuit.model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  // performDFSOnCircuit(nodes: Node[]): boolean {
  //   const visited = new Set<string>();
  //   const stack = new Set<string>();

  //   const dfs = (nodeId: string): boolean => {
  //     if (stack.has(nodeId)) {
  //       return true; // Found a cycle
  //     }
  //     if (visited.has(nodeId)) {
  //       return false;
  //     }

  //     visited.add(nodeId);
  //     stack.add(nodeId);

  //     // Directly use the connections from the node
  //     const currentNode = nodes.find((node) => node.id === nodeId);
  //     if (!currentNode) {
  //       return false; // Node not found, continue
  //     }

  //     const neighbors = currentNode.connections;
  //     for (let neighbor of neighbors) {
  //       if (dfs(neighbor)) {
  //         return true;
  //       }
  //     }

  //     stack.delete(nodeId);
  //     return false;
  //   };

  //   // Check each node if not already visited
  //   for (let node of nodes) {
  //     if (!visited.has(node.id) && dfs(node.id)) {
  //       return true; // Circuit is closed
  //     }
  //   }
  //   return false; // No cycles found, circuit isn't closed
  // }

  generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  circuitModelToGraphLinksModel(circuitModel: CircuitModel): any {
    const nodeDataArray = circuitModel.components.map((comp) => ({
      category: comp.type,
      value: comp.value,
      key: parseInt(comp.component_id),
    }));

    const linkDataArray = circuitModel.connections.map((conn) => ({
      from: parseInt(conn.from_component),
      to: parseInt(conn.to_component),
      fromPort: conn.from_port,
      toPort: conn.to_port,
      key: parseInt(conn.connection_id),
    }));

    return {
      class: 'GraphLinksModel',
      linkKeyProperty: 'key',
      linkFromPortIdProperty: 'fromPort',
      linkToPortIdProperty: 'toPort',
      nodeDataArray: nodeDataArray,
      linkDataArray: linkDataArray,
    };
  }

  graphLinksModeltoCircuitModel(graphData: any): CircuitModel {
    const defaultPorts: Record<string, PortDetails> = {};
    console.log(graphData);
    const components = graphData.nodeDataArray.map((node: any) => {
      return new Component(
        node.key.toString(),
        node.category as ComponentType,
        node.value,
        node.loc,
        node.ports || defaultPorts
      );
    });

    const connections = graphData.linkDataArray.map((link: any) => {
      return new Connection(
        link.key.toString(),
        link.from.toString(),
        link.fromPort,
        link.to.toString(),
        link.toPort
      );
    });

    return new CircuitModel(components, connections);
  }

  spiceToGraphLinksModel(netlist: string): any {
    const lines = netlist
      .split('\n')
      .filter((line) => line && !line.startsWith('*') && !line.startsWith('.'));
    let key = 0;
    const nodeDataArray: any[] = [];
    const linkDataArray: any[] = [];

    const portMappings: Record<string, string[]> = {
      R: ['in', 'out'],
      C: ['in', 'out'],
      L: ['in', 'out'],
      D: ['anode', 'cathode'],
      Q: ['collector', 'base', 'emitter'],
      U: ['in+', 'in-', 'out'],
      V: ['pos', 'neg'],
      I: ['pos', 'neg'],
      G: [],
    };

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const componentName = parts[0];
      const componentType = componentName[0];
      const value = parts[parts.length - 1];
      const nodes = parts.slice(1, parts.length - 1);

      const componentEnum = this.mapSpiceTypeToComponent(componentType);
      if (!componentEnum) return;

      const componentId = ++key;
      nodeDataArray.push({
        key: componentId,
        category: componentEnum,
        value: value,
        label: componentName,
      });

      const ports = portMappings[componentType];
      nodes.forEach((node, index) => {
        let fromPort = ports && ports.length > index ? ports[index] : 'unknown';
        let toPort = 'node' + node;

        linkDataArray.push({
          from: componentId,
          to: node,
          fromPort: fromPort,
          toPort: toPort,
          key: ++key,
        });
      });
    });

    return {
      class: 'GraphLinksModel',
      linkKeyProperty: 'key',
      linkFromPortIdProperty: 'fromPort',
      linkToPortIdProperty: 'toPort',
      nodeDataArray: nodeDataArray,
      linkDataArray: linkDataArray,
    };
  }

  circuitModelToSpice(circuitModel: CircuitModel): string {
    let netlist = '';
    const nodeConnections: Record<string, string[]> = {};
    const portMappings: Record<string, string[]> = {
      Resistor: ['+', '-'],
      Capacitor: ['+', '-'],
      Inductor: ['+', '-'],
      Diode: ['anode', 'cathode'],
      Transistor: ['collector', 'base', 'emitter'],
      Opamp: ['in+', 'in-', 'out'],
      'Voltage Source': ['pos', 'neg'],
      'Current Source': ['pos', 'neg'],
      Ground: [],
    };

    circuitModel.connections.forEach((conn) => {
      if (!nodeConnections[conn.from_component]) {
        nodeConnections[conn.from_component] = [];
      }
      if (!nodeConnections[conn.to_component]) {
        nodeConnections[conn.to_component] = [];
      }

      const fromPort = conn.from_port;
      const toPort = conn.to_port;
      nodeConnections[conn.from_component].push(
        conn.to_component + ' ' + toPort
      );
      nodeConnections[conn.to_component].push(
        conn.from_component + ' ' + fromPort
      );
    });

    circuitModel.components.forEach((comp) => {
      const spiceType = this.mapComponentTypeToSpice(comp.type);
      if (!spiceType) return;

      let line = `${spiceType}${comp.component_id} `;
      const connections = nodeConnections[comp.component_id].map(
        (connection) => {
          const [componentId, port] = connection.split(' ');
          return `${componentId}(${port})`;
        }
      );

      line += connections.join(' ') + ' ';
      line += comp.value;
      netlist += line + '\n';
    });

    return netlist;
  }

  mapSpiceTypeToComponent(type: string): string | null {
    const mapping: Record<string, string> = {
      R: ComponentType.RESISTOR,
      C: ComponentType.CAPACITOR,
      L: ComponentType.INDUCTOR,
      D: ComponentType.DIODE,
      Q: ComponentType.TRANSISTOR,
      V: ComponentType.VOLTAGE_SOURCE,
      I: ComponentType.CURRENT_SOURCE,
      U: ComponentType.OPAMP,
      G: ComponentType.GROUND,
    };
    return mapping[type] || null;
  }

  mapComponentTypeToSpice(type: ComponentType): string | null {
    const mapping: Record<ComponentType, string> = {
      [ComponentType.RESISTOR]: 'R',
      [ComponentType.CAPACITOR]: 'C',
      [ComponentType.INDUCTOR]: 'L',
      [ComponentType.DIODE]: 'D',
      [ComponentType.TRANSISTOR]: 'Q',
      [ComponentType.VOLTAGE_SOURCE]: 'V',
      [ComponentType.CURRENT_SOURCE]: 'I',
      [ComponentType.OPAMP]: 'U',
      [ComponentType.GROUND]: 'G',
    };
    return mapping[type] || null;
  }

  extractPathDFromSVGFile(filePath: string): string | null {
    try {
      const svgContent = fs.readFileSync(filePath, 'utf8');
      console.log(svgContent);
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const path = svgDoc.querySelector('path');
      return path ? path.getAttribute('d') : null;
    } catch (error) {
      console.error('Error reading SVG file:', error);
      return null;
    }
  }
}
