import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

  if (isAuthenticated) {
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/admin-login']);
  return false;
};
