import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Usuario {
  id?: number;
  username: string;
  password: string;
  nombreCompleto: string;
  local: string;
  almacen: string;
  rol?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8080/usuarios';

  private getAuthHeaders(): HttpHeaders {
  let token = '';
  let sessionId = '';

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('token') || '';
    sessionId = localStorage.getItem('sessionId') || '';
  }

  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'sessionId': sessionId,
    'Content-Type': 'application/json'
  });
}


  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Usuario[]>(`${this.apiUrl}/listar`, { headers });
  }

  // Crear usuario
  crearUsuario(usuario: Usuario): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http.post<Usuario>(`${this.apiUrl}/crear`, usuario, { headers });
  }

  // Modificar usuario
  modificarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http.put<Usuario>(`${this.apiUrl}/modificar/${id}`, usuario, { headers });
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`, { 
        headers,
        responseType: 'text' as 'json'  
    });
    
  }
}