import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
@Injectable({
   providedIn: 'root'
})
export class AuthService {
   constructor(private router: Router) { }
   logOut() {
      localStorage.clear();
      this.router.navigate(['/login']);
   }
}
