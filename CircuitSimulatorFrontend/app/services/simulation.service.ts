import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  saveCircuit(circuitData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, circuitData);
  }

  sendCircuitForAnalysis(circuitData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze`, circuitData);
  }

  getCircuitById(circuitId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/circuit/${circuitId}`);
  }
}
