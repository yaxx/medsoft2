import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({
   providedIn: 'root'
})
export class AuthGuard implements CanActivate {
   constructor(private router: Router) { }
   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (this.isLoggedIn()) {
        return true;
      }
      this.router.navigate(['/login']);
      return false;
}
public isLoggedIn(): boolean {
   return (localStorage.getItem('isLoggedIn') === 'true') ? true : false;
  }
public logout() {
   localStorage.clear()
   this.router.navigate(['/login']);
  }
}
