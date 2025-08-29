import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConteoService, ConteoRequest } from '../../services/conteo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 👈 importa esto

@Component({
  selector: 'app-conteo',
  standalone: true,
  imports: [FormsModule, CommonModule], // 👈 agrega CommonModule aquí
  templateUrl: './conteo.html',
  styleUrls: ['./conteo.css']
})
export class ConteoComponent implements OnInit {
  mensaje: string = '';
  usuarioRol: string = ''; // 👈 importante: aquí deberías guardar el rol extraído del token/login

  conteoData: ConteoRequest = {
    materialId: 0,
    conteo: 0,
    obs: '',  
    local: ''
  };

  constructor(
    private conteoService: ConteoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
   const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.conteoData.materialId = +id;
  }

  // ❌ Esto era solo para pruebas
  // this.usuarioRol = 'ADMINISTRADOR';

  // ✅ Ahora se lee del localStorage (lo guardaste en el login)
  this.usuarioRol = localStorage.getItem('rol') || '';
  console.log("Rol detectado en conteo:", this.usuarioRol);
  }

  registrarConteo() {
    const payload: ConteoRequest = {
      materialId: this.conteoData.materialId,
      conteo: this.conteoData.conteo,
      obs: this.conteoData.obs,
      local: this.usuarioRol === 'ADMINISTRADOR' ? this.conteoData.local : undefined
    };

    console.log("Payload enviado:", payload);

    this.conteoService.registrarConteo(payload).subscribe({
      next: () => {
        this.mensaje = 'Conteo registrado con éxito ✅';
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        console.error('Error al registrar conteo:', err);
        this.mensaje = 'Error al registrar conteo ❌';
      }
    });
  }

  regresar() {
    this.router.navigate(['/dashboard']);
  }
}
