import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import {
  CircuitComponent,
  CircuitComponentType,
  CircuitConnection,
} from 'app/models/circuit.model';
import { CircuitUtils } from 'app/utils/circuit.util';
import { CircuitService } from 'app/services/circuit.service';

@Component({
  selector: 'app-circuit-editor',
  templateUrl: './circuit-editor.component.html',
  styleUrls: ['./circuit-editor.component.scss'],
})
export class CircuitEditorComponent implements OnInit {
  update$: Subject<boolean> = new Subject();
  nodes: CircuitComponent[] = [];
  links: CircuitConnection[] = [];
  hoveredLinkId: string | null = null;
  componentTypes = Object.values(CircuitComponentType);

  private _selectedComponentType: CircuitComponentType | null = null;

  get selectedComponentType(): CircuitComponentType | null {
    return this._selectedComponentType;
  }

  set selectedComponentType(value: CircuitComponentType | null) {
    this._selectedComponentType = value;
  }

  ngOnInit(): void {}

  constructor(private circuitService: CircuitService) {
    this.circuitService
      .getCircuitNodes()
      .subscribe((nodes) => (this.nodes = nodes));
    this.circuitService
      .getCircuitLinks()
      .subscribe((links) => (this.links = links));
  }

  addNode(type: CircuitComponentType | null, value: number = 0): void {
    if (!type) {
      return;
    }

    const label = this.generateLabel(type);
    const newNode = new CircuitComponent(
      CircuitUtils.generateGUID(),
      type,
      value,
      label
    );
    this.nodes.push(newNode);
    this.circuitService.setCircuitNodes(this.nodes);
    this.update$.next(true);
    console.log(this.nodes);
  }

  addLink(source: string, target: string): void {
    if (!this.canAddLink(source, target)) return;

    const newLink = new CircuitConnection(
      CircuitUtils.generateGUID(),
      source,
      target
    );
    this.links.push(newLink);

    // Atualizar as conexões nos nodes correspondentes
    this.nodes.forEach((node) => {
      if (node.id === source) {
        node.connections.push(target);
      }
      if (node.id === target) {
        node.connections.push(source);
      }
    });

    this.circuitService.setCircuitNodes(this.nodes);
    this.circuitService.setCircuitLinks(this.links);

    this.update$.next(true);
    console.log('nodes - \n' + this.nodes);
    console.log('links - \n' + this.links);
  }

  toggleLinkActive(id: string): void {
    const link = this.links.find((l) => l.id === id);
    if (link) {
      link.active = !link.active;
      this.update$.next(true);
    }
    this.circuitService.setCircuitLinks(this.links);
  }

  canAddLink(source: string, target: string): boolean {
    if (source === target) return false;

    return !this.links.some(
      (l) =>
        (l.source === source && l.target === target) ||
        (l.source === target && l.target === source)
    );
  }

  removeNode(id: string): void {
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.links = this.links.filter((l) => l.source !== id && l.target !== id);

    this.circuitService.setCircuitNodes(this.nodes);
    this.circuitService.setCircuitLinks(this.links);
    this.update$.next(true);
  }

  removeLink(id: string): void {
    this.links = this.links.filter((l) => l.id !== id);
    this.circuitService.setCircuitLinks(this.links);
    this.update$.next(true);
  }

  generateLabel(type: CircuitComponentType): string {
    const prefix =
      {
        [CircuitComponentType.Resistor]: 'R',
        [CircuitComponentType.Capacitor]: 'C',
        [CircuitComponentType.Inductor]: 'L',
        [CircuitComponentType.VoltageSource]: 'V',
        [CircuitComponentType.CurrentSource]: 'I',
        [CircuitComponentType.Junction]: 'J',
      }[type] || 'Component';

    return `${prefix}${this.nodes.filter((n) => n.type === type).length + 1}`;
  }
}
