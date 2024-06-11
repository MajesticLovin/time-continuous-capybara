import { Injectable } from '@angular/core';
import {
  Node,
  CircuitData,
  SimulationRequest,
  SimulationType,
} from '../models/circuit.model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  // static performDFSOnCircuit(nodes: Node[]): boolean {
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

  formatForGoJS(circuitData: CircuitData): any {
    let formattedNodes = circuitData.nodes.map((node) => ({
      key: node.id,
      text: node.label,
      // Adicione mais atributos de formatação se necessário
    }));

    let formattedLinks = circuitData.links.map((link) => ({
      from: link.source,
      to: link.target,
      // Adicionar label ou outras propriedades se necessário
    }));

    return {
      nodeDataArray: formattedNodes,
      linkDataArray: formattedLinks,
    };
  }
}
