import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConteoRequest {
  materialId: number;
  conteo: number;
  obs: string;
  local?: string;
}

export interface ReconteoRequest {
  materialId: number;
  reconteo: number;
  obs: string;
  local?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConteoService {
  private apiUrl = 'http://localhost:8080/materiales/conteo';
  private reconteoApiUrl = 'http://localhost:8080/materiales/reconteo';

  constructor(private http: HttpClient) {}

  registrarConteo(data: ConteoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  registrarReconteo(data: ReconteoRequest): Observable<any> {
    return this.http.post(this.reconteoApiUrl, data);
  }
}