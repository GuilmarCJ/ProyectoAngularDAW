import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard]  // ← Aquí aplicas el guard
  },
  { 
    path: '', 
    redirectTo: '/dashboard',  // ← Cambia esto de '/login' a '/dashboard'
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/dashboard'  // ← Ruta comodín para cualquier otra ruta
  }
];
