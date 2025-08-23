import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MaterialesResponse, Material } from '../models/material.model';

export interface LoginResponse {
  sessionId: string;
  rol: string;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:8080';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Método para verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token && this.isBrowser()) {
            this.setSession(response, credentials.username);
            this.isAuthenticatedSubject.next(true);
          }
        })  
      );
  }

  private setSession(authResult: LoginResponse, username: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('sessionId', authResult.sessionId);
      localStorage.setItem('rol', authResult.rol);
      localStorage.setItem('username', username);
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('rol');
      localStorage.removeItem('username');
    }
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('token') : null;
  }

  getSessionId(): string | null {
    return this.isBrowser() ? localStorage.getItem('sessionId') : null;
  }

  getRol(): string | null {
    return this.isBrowser() ? localStorage.getItem('rol') : null;
  }

  getUsername(): string | null {
    return this.isBrowser() ? localStorage.getItem('username') : null;
  }

  private hasToken(): boolean {
    return this.isBrowser() ? !!this.getToken() : false;
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const payloadObj = JSON.parse(decodedPayload);
      return payloadObj.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

   // Método para obtener materiales
  getMateriales(): Observable<MaterialesResponse> {
    const token = this.getToken();
    const sessionId = this.getSessionId();
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'sessionId': sessionId || ''
    });

    return this.http.get<MaterialesResponse>(`${this.apiUrl}/materiales`, { headers });
  }

  // Método para verificar si tenemos todos los datos de autenticación
  hasAuthData(): boolean {
    return this.isBrowser() && 
           !!this.getToken() && 
           !!this.getSessionId() && 
           !!this.getRol();
  }

  // Método para obtener headers de autenticación
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'sessionId': this.getSessionId() || ''
    });
  }

}