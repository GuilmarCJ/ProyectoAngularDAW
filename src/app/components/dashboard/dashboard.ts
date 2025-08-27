import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import { AuthService } from '../../services/auth.service';
import { Material } from '../../models/material.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private materialService = inject(MaterialService);
  private authService = inject(AuthService);
  private router = inject(Router);

  materiales: Material[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  username: string | null = null;
  rol: string | null = null;

    isSidebarOpen: boolean = false;

  ngOnInit(): void {
    this.loadMateriales();
    this.username = this.authService.getUsername();
    this.rol = this.authService.getRol();
  }

  loadMateriales(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.materialService.getMateriales().subscribe({
      next: (response) => {
        this.materiales = response.materiales;
        this.isLoading = false;
        console.log('Materiales cargados:', response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los materiales';
        console.error('Error:', error);
        
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) return 'estado-pendiente';
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('activo') || estadoLower.includes('completado')) {
      return 'estado-activo';
    } else if (estadoLower.includes('pendiente')) {
      return 'estado-pendiente';
    } else {
      return 'estado-inactivo';
    }
  }

  // 🚀 Método nuevo
  irAConteo(id: number): void {
    this.router.navigate(['/conteo', id]);
  }

  // 🔹 NUEVOS MÉTODOS PARA EL DASHBOARD
  getPendientes(): number {
  if (!this.materiales) return 0;
  return this.materiales.filter(m => !m.estado || m.estado.toUpperCase() === 'PENDIENTE').length;
}

getActivos(): number {
  if (!this.materiales) return 0;
  return this.materiales.filter(m => m.estado && m.estado.toUpperCase() === 'ACTIVO').length;
}

  getLastUpdate(): string {
    if (this.materiales.length === 0) return '-';

    const fechas = this.materiales
      .map(m => new Date(m.fecSys ?? m.fecReg ?? m.fec ?? '')) // 👈 usamos tus campos reales
      .filter(f => !isNaN(f.getTime()));
    
    if (fechas.length === 0) return '-';
    
    const ultimaFecha = new Date(Math.max(...fechas.map(f => f.getTime())));
    return ultimaFecha.toLocaleString();
  }

  // Alternar el estado (abrir/cerrar)
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Método extra por si quieres cerrarlo manualmente
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  getEstadoIcon(estado: string | undefined): string {
    if (!estado) return 'fas fa-clock';
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('activo') || estadoLower.includes('completado')) {
      return 'fas fa-check-circle';
    } else if (estadoLower.includes('pendiente')) {
      return 'fas fa-clock';
    } else {
      return 'fas fa-times-circle';
    }
  }

}