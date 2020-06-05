import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  correo: string
  pass: string

  isConnected = true

  netSub: Subscription

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private netService: NetworkService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.netSub = this.netService.isConnected.subscribe(res => {
      this.isConnected = res
    })
  }

  async ingresarConCorreo() {
    await this.alertService.presentLoading();
    try {
      const correo = this.correo.trim() + '@spot.com'
      const resp = await this.authService.loginWithEmail(correo, this.pass)
      this.alertService.dismissLoading()
      if (resp) {
        this.router.navigate(['/home'])
      } else {
        this.alertService.presentAlert('Usuario no registrado', 'Por favor registra una cuenta antes de ingresar')
      }
    } catch (error) {
      this.alertService.dismissLoading()
      if (error.code === 'auth/user-not-found') {
        this.alertService.presentAlert('Usuario no registrado', 'Por favor registra tu cuenta antes de ingresar')
      } else if (error.code === 'auth/wrong-password') {
        this.alertService.presentAlert('Contraseña inválida', 'La contraseña no es correcta, por favor intenta de nuevo')
      } else {
        this.alertService.presentAlert('Error', 'Algo salió mal, por favor intenta de nuevo' + error)
      }
    }
  }

  ionViewWillLeave() {
    if (this.netSub) this.netSub.unsubscribe()
  }

}
