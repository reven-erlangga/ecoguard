import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { authFlowGuard } from './shared/guards/auth-flow.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [authFlowGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [authFlowGuard]
  },
  {
    path: 'blank',
    loadComponent: () => import('./pages/blank/blank.component').then(m => m.BlankComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/templates/admin-template/admin-template.component').then(m => m.AdminTemplateComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent)
      },
      {
        path: 'monitoring',
        loadComponent: () => import('./pages/monitoring/monitoring.component').then(m => m.MonitoringComponent)
      },
      {
        path: 'tutorial',
        loadComponent: () => import('./pages/tutorial/tutorial.component').then(m => m.TutorialComponent)
      },
      {
        path: 'issue',
        loadComponent: () => import('./pages/issue/issue.component').then(m => m.IssueComponent)
      },
      {
        path: 'issue/:id',
        loadComponent: () => import('./pages/issue-detail/issue-detail.component').then(m => m.IssueDetailComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/blank/blank.component').then(m => m.BlankComponent)
  }
];
