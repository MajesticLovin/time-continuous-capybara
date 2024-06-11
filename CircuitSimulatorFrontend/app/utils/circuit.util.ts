import {
  SimulationRequest,
  SimulationType,
} from 'app/models/simulation-request.model';
import { CircuitComponent } from 'app/models/circuit.model';

export class CircuitUtils {
  static isCircuitClosed(nodes: CircuitComponent[]): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (stack.has(nodeId)) {
        return true; // Found a cycle
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      stack.add(nodeId);

      // Directly use the connections from the node
      const currentNode = nodes.find((node) => node.id === nodeId);
      if (!currentNode) {
        return false; // Node not found, continue
      }

      const neighbors = currentNode.connections;
      for (let neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      stack.delete(nodeId);
      return false;
    };

    // Check each node if not already visited
    for (let node of nodes) {
      if (!visited.has(node.id) && dfs(node.id)) {
        return true; // Circuit is closed
      }
    }
    return false; // No cycles found, circuit isn't closed
  }

  static generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  static validateSimulationRequest(json: any): json is SimulationRequest {
    const hasBasicProps =
      typeof json.id === 'string' &&
      typeof json.name === 'string' &&
      Object.values(SimulationType).includes(json.sim_type) &&
      typeof json.ac_analysis === 'boolean';

    if (!hasBasicProps) return false;

    if (!json.data || !Array.isArray(json.data.nodes)) return false;

    for (const node of json.data.nodes) {
      const hasNodeProps =
        typeof node.id === 'string' &&
        typeof node.label === 'string' &&
        Array.isArray(node.connections) &&
        node.connections.every((id: any) => typeof id === 'string');

      if (
        !hasNodeProps ||
        (node.value !== undefined && typeof node.value !== 'number')
      ) {
        return false;
      }
    }

    return true;
  }
}
