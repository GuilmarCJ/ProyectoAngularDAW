import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConteoRequest {
  materialId: number;
  conteo: number;
  obs: string;
  local?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConteoService {
  private apiUrl = 'http://localhost:8080/materiales/conteo';

  constructor(private http: HttpClient) {}

  registrarConteo(data: ConteoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}

  