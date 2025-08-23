import { Injectable, inject  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaterialesResponse, Material } from '../models/material.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
   private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8080';

  getMateriales(): Observable<MaterialesResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<MaterialesResponse>(`${this.apiUrl}/materiales`, { headers });
  }

  // Método para filtrar materiales (si tu backend lo soporta)
  filtrarMateriales(consultaId: string, filtros: any): Observable<Material[]> {
    const headers = this.authService.getAuthHeaders();
    const body = {
      consultaId: consultaId,
      ...filtros
    };
    
    return this.http.post<Material[]>(`${this.apiUrl}/materiales/filtro`, body, { headers });
  }
}
