import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent)
  },
  { path: '**', redirectTo: '' }
];
