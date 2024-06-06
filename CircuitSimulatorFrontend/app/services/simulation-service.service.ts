import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private baseUrl = 'http://localhost:5000'; // URL do servidor Flask
  // trocar para url vinda de arquivo para deploy

  constructor(private http: HttpClient) { }


  //mudar any para simulation request class
  simulateCircuit(simulationData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/simulate`, simulationData);
  }
}
