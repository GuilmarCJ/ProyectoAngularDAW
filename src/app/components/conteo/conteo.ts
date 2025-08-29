import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConteoService, ConteoRequest } from '../../services/conteo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-conteo',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './conteo.html',
  styleUrls: ['./conteo.css']
})
export class ConteoComponent implements OnInit {
  mensaje: string = '';            // guarda el mensaje de éxito o error
  usuarioRol: string = '';         // guarda el rol del usuario

  // datos que se enviarán al backend
  conteoData: ConteoRequest = {
    materialId: 0,
    conteo: 0,
    obs: '',  
    local: ''
  };

  constructor(
    private conteoService: ConteoService, // servicio para enviar datos al backend
    private route: ActivatedRoute,        // obtiene parámetros de la URL
    private router: Router                // permite navegar entre páginas
  ) {}

  ngOnInit(): void {
    // obtiene el id del material desde la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.conteoData.materialId = +id;
    }

    // obtiene el rol guardado en el localStorage
    this.usuarioRol = localStorage.getItem('rol') || '';
    console.log("Rol detectado en conteo:", this.usuarioRol);
  }

  registrarConteo() {
    // arma los datos que se enviarán al backend
    const payload: ConteoRequest = {
      materialId: this.conteoData.materialId,
      conteo: this.conteoData.conteo,
      obs: this.conteoData.obs,
      // solo ADMINISTRADOR puede enviar el local
      local: this.usuarioRol === 'ADMINISTRADOR' ? this.conteoData.local : undefined
    };

    console.log("Payload enviado:", payload);

    // llama al servicio para registrar el conteo
    this.conteoService.registrarConteo(payload).subscribe({
      next: () => {
        this.mensaje = 'Conteo registrado con éxito ✅'; // mensaje si todo salió bien
        // redirige al dashboard después de 1.5 segundos
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        console.error('Error al registrar conteo:', err); // muestra el error en consola
        this.mensaje = 'Error al registrar conteo ❌';    // mensaje de error
      }
    });
  }

  regresar() {
    // vuelve al dashboard
    this.router.navigate(['/dashboard']);
  }
}

