import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../services/permissions.service';
import { RegionService } from '../services/region.service';
@Injectable({
  providedIn: 'root'
})
export class PermisosGuard implements CanActivate {

  constructor(
    private router: Router,
    private permissionService: PermissionsService,
    private regionService: RegionService,
    private authService: AuthService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.authService.checkUser()
      .then(uid => {
        if (uid) {
          return this.regionService.checkRegion()
        } else {
          this.router.navigate(['/login'])
          return false
        }
      })
      .then(() => this.permissionService.checkPermisos())
      .catch(err => {
        console.log(err)
        this.router.navigate(['/login'])
        return false
      })
  }

}
