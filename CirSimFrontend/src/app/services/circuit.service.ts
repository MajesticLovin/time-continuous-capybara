import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RequestModel } from './../models/request.model'; // Assuma que temos uma exportação dessas classes

@Injectable({
  providedIn: 'root',
})
export class CircuitService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  saveCircuit(circuitData: RequestModel): Observable<any> {
    const payload = RequestModel.toDict(circuitData);
    return this.http.post(`${this.apiUrl}/circuit/save`, payload);
  }

  sendCircuitForAnalysis(circuitData: RequestModel): Observable<any> {
    const payload = RequestModel.toDict(circuitData);
    return this.http.post(`${this.apiUrl}/circuit/simulate`, payload);
  }

  getCircuitById(circuitId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/circuit/${circuitId}`);
  }

  deleteCircuit(circuitId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/circuit/delete/${circuitId}`);
  }

  listCircuits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/circuits`);
  }
}
