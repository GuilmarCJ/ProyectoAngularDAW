import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css'
})
export class GestionUsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  usuarios: Usuario[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Variables para modales
  showCrearUsuarioModal: boolean = false;
  showModificarUsuarioModal: boolean = false;
  showEliminarUsuarioModal: boolean = false;
  
  nuevoUsuario: Usuario = {
    username: '',
    password: '',
    nombreCompleto: '',
    local: '',
    almacen: ''
  };
  
  usuarioSeleccionado: Usuario = {
    id: 0,
    username: '',
    password: '',
    nombreCompleto: '',
    local: '',
    almacen: ''
  };

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        
        if (error.status === 403) {
          this.errorMessage = 'No tiene permisos para acceder a esta función.';
        } else if (error.status === 401) {
          this.errorMessage = 'Sesión expirada. Redirigiendo al login...';
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = 'Error al cargar los usuarios. Verifique su conexión.';
        }
        
        this.isLoading = false;
      }
    });
  }

  // Métodos para modales
  openCrearUsuarioModal(): void {
    this.nuevoUsuario = {
      username: '',
      password: '',
      nombreCompleto: '',
      local: '',
      almacen: ''
    };
    this.successMessage = '';
    this.errorMessage = '';
    this.showCrearUsuarioModal = true;
  }

  closeCrearUsuarioModal(): void {
    this.showCrearUsuarioModal = false;
  }

  openModificarUsuarioModal(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.successMessage = '';
    this.errorMessage = '';
    this.showModificarUsuarioModal = true;
  }

  closeModificarUsuarioModal(): void {
    this.showModificarUsuarioModal = false;
  }

  openEliminarUsuarioModal(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.successMessage = '';
    this.errorMessage = '';
    this.showEliminarUsuarioModal = true;
  }

  closeEliminarUsuarioModal(): void {
    this.showEliminarUsuarioModal = false;
  }

  // Métodos para CRUD
  crearUsuario(): void {
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (usuarioCreado) => {
        this.successMessage = 'Usuario creado con éxito ✅';
        this.usuarios.push(usuarioCreado);
        setTimeout(() => {
          this.closeCrearUsuarioModal();
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.errorMessage = 'Error al crear usuario ❌';
        if (err.status === 403) {
          this.errorMessage = 'No tiene permisos para crear usuarios.';
        }
      }
    });
  }

  modificarUsuario(): void {
    if (!this.usuarioSeleccionado.id) {
      this.errorMessage = 'ID de usuario no válido';
      return;
    }

    this.usuarioService.modificarUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe({
      next: (usuarioActualizado) => {
        this.successMessage = 'Usuario modificado con éxito ✅';
        const index = this.usuarios.findIndex(u => u.id === usuarioActualizado.id);
        if (index !== -1) {
          this.usuarios[index] = usuarioActualizado;
        }
        setTimeout(() => {
          this.closeModificarUsuarioModal();
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Error al modificar usuario:', err);
        this.errorMessage = 'Error al modificar usuario ❌';
        if (err.status === 403) {
          this.errorMessage = 'No tiene permisos para modificar usuarios.';
        }
      }
    });
  }

  confirmarEliminarUsuario(): void {
    if (!this.usuarioSeleccionado.id) {
      this.errorMessage = 'ID de usuario no válido';
      return;
    }

    this.usuarioService.eliminarUsuario(this.usuarioSeleccionado.id).subscribe({
      next: () => {
        this.successMessage = 'Usuario eliminado con éxito ✅';
        this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioSeleccionado.id);
        setTimeout(() => {
          this.closeEliminarUsuarioModal();
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.errorMessage = 'Error al eliminar usuario ❌';
        if (err.status === 403) {
          this.errorMessage = 'No tiene permisos para eliminar usuarios.';
        }
      }
    });
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}