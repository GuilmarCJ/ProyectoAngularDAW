import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import { AuthService } from '../../services/auth.service';
import { Material } from '../../models/material.model';
import { FormsModule } from '@angular/forms'; // 👈 Añade esta importación
import { ConteoService, ConteoRequest, ReconteoRequest } from '../../services/conteo.service'; // 👈 Añade esta 
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private materialService = inject(MaterialService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private conteoService = inject(ConteoService);
  private http = inject(HttpClient); 
  private usuarioService = inject(UsuarioService);

  materiales: Material[] = [];
  materialesFiltrados: Material[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  username: string | null = null;
  rol: string | null = null;

    isSidebarOpen: boolean = false;

    filtroMaterial: string = '';
  filtroLocal: string = '';
  filtroEstado: string = '';
  consultaId: string = '';
  filtrosActivos: boolean = false;
    
    showConteoModal: boolean = false;
    showReconteoModal: boolean = false;
  mensajeConteo: string = '';
  mensajeReconteo: string = '';
  usuarioRol: string = '';
  conteoData: ConteoRequest = {
    materialId: 0,
    conteo: 0,
    obs: '',
    local: ''
  };
reconteoData: ReconteoRequest = {
    materialId: 0,
    reconteo: 0,
    obs: '',
    local: ''
  };

   // Variables para gestión de usuarios
  showCrearUsuarioModal: boolean = false;
  showModificarUsuarioModal: boolean = false;
  showEliminarUsuarioModal: boolean = false;
  mensajeUsuario: string = '';
  nuevoUsuario: Usuario = {
    username: '',
    password: '',
    nombreCompleto: '',
    local: '',
    almacen: ''
  };
  usuarioSeleccionado: Usuario = {
    username: '',
    password: '',
    nombreCompleto: '',
    local: '',
    almacen: ''
  };
  usuarios: Usuario[] = [];

  ngOnInit(): void {
    this.loadMateriales();
    this.username = this.authService.getUsername();
    this.rol = this.authService.getRol();
    
    this.usuarioRol = localStorage.getItem('rol') || '';

    if (this.usuarioRol === 'ADMINISTRADOR') {
      this.cargarUsuarios();
    }
  }

  cargarUsuarios(): void {
  
}



  loadMateriales(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.materialService.getMateriales().subscribe({
      next: (response) => {
        this.materiales = response.materiales;
        this.isLoading = false;
        this.materialesFiltrados = [...this.materiales];
        this.consultaId = response.consultaId;
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
    this.openConteoModal(id);
  }

  //recontwo
  openReconteoModal(materialId: number): void {
    this.reconteoData = {
      materialId: materialId,
      reconteo: 0,
      obs: '',
      local: ''
    };
    this.mensajeReconteo = '';
    this.showReconteoModal = true;
  }

  closeReconteoModal(): void {
    this.showReconteoModal = false;
    this.mensajeReconteo = '';
  }

  registrarReconteo(): void {
    const payload: ReconteoRequest = {
      materialId: this.reconteoData.materialId,
      reconteo: this.reconteoData.reconteo,
      obs: this.reconteoData.obs,
      local: this.usuarioRol === 'ADMINISTRADOR' ? this.reconteoData.local : undefined
    };

    console.log("Payload de reconteo enviado:", payload);

    this.conteoService.registrarReconteo(payload).subscribe({
      next: () => {
        this.mensajeReconteo = 'Reconteo registrado con éxito ✅';
        setTimeout(() => {
          this.loadMateriales();
          this.closeReconteoModal();
        }, 1500);
      },
      error: (err) => {
        console.error('Error al registrar reconteo:', err);
        this.mensajeReconteo = 'Error al registrar reconteo ❌';
      }
    });
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


    openConteoModal(materialId: number): void {
    this.conteoData = {
      materialId: materialId,
      conteo: 0,
      obs: '',
      local: ''
    };
    this.mensajeConteo = '';
    this.showConteoModal = true;
  }

  closeConteoModal(): void {
    this.showConteoModal = false;
    this.mensajeConteo = '';
  }

  registrarConteo(): void {
    const payload: ConteoRequest = {
      materialId: this.conteoData.materialId,
      conteo: this.conteoData.conteo,
      obs: this.conteoData.obs,
      local: this.usuarioRol === 'ADMINISTRADOR' ? this.conteoData.local : undefined
    };

    console.log("Payload enviado:", payload);

    this.conteoService.registrarConteo(payload).subscribe({
      next: () => {
        this.mensajeConteo = 'Conteo registrado con éxito ✅';
        // Recargar los materiales después de un conteo exitoso
        setTimeout(() => {
          this.loadMateriales();
          this.closeConteoModal();
        }, 1500);
      },
      error: (err) => {
        console.error('Error al registrar conteo:', err);
        this.mensajeConteo = 'Error al registrar conteo ❌';
      }
    });
  }

aplicarFiltros(): void {
  this.isLoading = true;
  
  // Preparar los filtros para enviar al backend
  const filtros: any = {};

  if (this.filtroMaterial) {
    filtros.material = this.filtroMaterial;
  }

  // Solo enviar local si es administrador y hay un local seleccionado
  if (this.usuarioRol === 'ADMINISTRADOR' && this.filtroLocal) {
    filtros.local = this.filtroLocal;
  }

  // Usar el servicio de materiales en lugar de HttpClient directamente
  this.materialService.filtrarMateriales(this.consultaId, filtros)
    .subscribe({
      next: (materialesFiltrados) => {
        this.materialesFiltrados = materialesFiltrados;
        this.filtrosActivos = true;
        this.isLoading = false;
        this.errorMessage = ''; // Limpiar mensajes de error previos
      },
      // En el método aplicarFiltros, cambia el error handling:
      error: (error) => {
        this.handleFilterError(error);
        this.isLoading = false;
      }
    });
}

 filtrarLocalmente(): void {
  let materialesFiltrados = [...this.materiales];
  
  // Filtro por material
  if (this.filtroMaterial) {
    materialesFiltrados = materialesFiltrados.filter(material => 
      material.material.toLowerCase().includes(this.filtroMaterial.toLowerCase()) ||
      (material.descripcion && material.descripcion.toLowerCase().includes(this.filtroMaterial.toLowerCase()))
    );
  }
  
  // Filtro por local (solo para admin)
  if (this.usuarioRol === 'ADMINISTRADOR' && this.filtroLocal) {
    materialesFiltrados = materialesFiltrados.filter(material => 
      material.local === this.filtroLocal
    );
  }
  
  // Filtro por estado (siempre local)
  if (this.filtroEstado) {
    materialesFiltrados = materialesFiltrados.filter(material => {
      const estadoMaterial = material.estado || 'PENDIENTE';
      return estadoMaterial.toUpperCase() === this.filtroEstado.toUpperCase();
    });
  }
  
  this.materialesFiltrados = materialesFiltrados;
  this.filtrosActivos = true;
}

  limpiarFiltros(): void {
    this.filtroMaterial = '';
    this.filtroLocal = '';
    this.filtroEstado = '';
    this.filtrosActivos = false;
    this.materialesFiltrados = [...this.materiales];
  }

 getPendientes(): number {
  if (!this.materialesFiltrados || this.materialesFiltrados.length === 0) return 0;
  return this.materialesFiltrados.filter(m => !m.estado || m.estado.toUpperCase() === 'PENDIENTE').length;
}

getActivos(): number {
  if (!this.materialesFiltrados || this.materialesFiltrados.length === 0) return 0;
  return this.materialesFiltrados.filter(m => m.estado && m.estado.toUpperCase() === 'ACTIVO').length;
}

private handleFilterError(error: any): void {
  console.error('Error en filtrado:', error);
  
  if (error.status === 401 || error.status === 403) {
    this.errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    }, 2000);
  } else if (error.status === 400) {
    this.errorMessage = 'Consulta inválida. Recargando materiales...';
    setTimeout(() => this.loadMateriales(), 2000);
  } else {
    this.errorMessage = 'Error al aplicar filtros. Usando filtrado local.';
    this.filtrarLocalmente();
  }
}

// Métodos para gestión de usuarios

openCrearUsuarioModal(): void {
    this.nuevoUsuario = {
      username: '',
      password: '',
      nombreCompleto: '',
      local: '',
      almacen: ''
    };
    this.mensajeUsuario = '';
    this.showCrearUsuarioModal = true;
  }

  closeCrearUsuarioModal(): void {
    this.showCrearUsuarioModal = false;
  }

  crearUsuario(): void {
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (usuarioCreado) => {
        this.mensajeUsuario = 'Usuario creado con éxito ✅';
        this.usuarios.push(usuarioCreado);
        setTimeout(() => {
          this.closeCrearUsuarioModal();
          this.mensajeUsuario = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.mensajeUsuario = 'Error al crear usuario ❌';
      }
    });
  }

  openModificarUsuarioModal(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.mensajeUsuario = '';
    this.showModificarUsuarioModal = true;
  }

  closeModificarUsuarioModal(): void {
    this.showModificarUsuarioModal = false;
  }

  modificarUsuario(): void {
    if (!this.usuarioSeleccionado.id) {
      this.mensajeUsuario = 'ID de usuario no válido';
      return;
    }

    this.usuarioService.modificarUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe({
      next: (usuarioActualizado) => {
        this.mensajeUsuario = 'Usuario modificado con éxito ✅';
        // Actualizar la lista de usuarios
        const index = this.usuarios.findIndex(u => u.id === usuarioActualizado.id);
        if (index !== -1) {
          this.usuarios[index] = usuarioActualizado;
        }
        setTimeout(() => {
          this.closeModificarUsuarioModal();
          this.mensajeUsuario = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Error al modificar usuario:', err);
        this.mensajeUsuario = 'Error al modificar usuario ❌';
      }
    });
  }

  openEliminarUsuarioModal(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.mensajeUsuario = '';
    this.showEliminarUsuarioModal = true;
  }

  closeEliminarUsuarioModal(): void {
    this.showEliminarUsuarioModal = false;
  }

  confirmarEliminarUsuario(): void {
    if (!this.usuarioSeleccionado.id) {
      this.mensajeUsuario = 'ID de usuario no válido';
      return;
    }

    this.usuarioService.eliminarUsuario(this.usuarioSeleccionado.id).subscribe({
      next: () => {
        this.mensajeUsuario = 'Usuario eliminado con éxito ✅';
        // Remover de la lista de usuarios
        this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioSeleccionado.id);
        setTimeout(() => {
          this.closeEliminarUsuarioModal();
          this.mensajeUsuario = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.mensajeUsuario = 'Error al eliminar usuario ❌';
      }
    });
  }

  // Método para verificar si el usuario actual es administrador
  esAdministrador(): boolean {
    return this.usuarioRol === 'ADMINISTRADOR';
  }

  // Variables para el submenu
showGestionUsuarios: boolean = false;

// Método para toggle del submenu
toggleGestionUsuarios(event: Event): void {
  event.preventDefault();
  this.showGestionUsuarios = !this.showGestionUsuarios;
}

// Método para abrir modal de listar usuarios (para modificar/eliminar)
openListarUsuariosModal(): void {
  // Aquí implementarías la lógica para listar usuarios y luego seleccionar uno para modificar/eliminar
  // Por ahora, solo mostraremos un alert indicando que se necesita implementar
  alert('Funcionalidad de listar usuarios para modificar/eliminar será implementada próximamente');
}

}