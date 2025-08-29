import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { ConteoComponent } from './components/conteo/conteo';
import { authGuard } from './guards/auth-guard';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard]  
  },
  { 
    path: 'conteo/:id',  
    component: ConteoComponent,
    canActivate: [authGuard]
  },
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { path: 'gestion-usuarios', component: GestionUsuariosComponent },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];

