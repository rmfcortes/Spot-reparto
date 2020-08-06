import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Platform, IonInput } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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

  back: Subscription

  err: string
  form: FormGroup
  validation_messages: any


  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private alertService: AlertService,
    private netService: NetworkService,
  ) { }

  ngOnInit() {
    this.netService.checkNetStatus()
    this.setForm()
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      const nombre = 'app'
      navigator[nombre].exitApp()
    })
  }

  setForm() {
    this.form = new FormGroup({
      'email': new FormControl('', Validators.compose([Validators.required])),
      'password': new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
      'isPersistent': new FormControl(true)
    },
    { updateOn: 'blur'})

    this.validation_messages = {
      'email': [
          { type: 'required', message: 'Este campo es necesario' },
        ],
        'password': [
          { type: 'required', message: 'Este campo es requerido' },
          { type: 'minlength', message: 'La contraseña debe tener al menos 6 caracteres' },
        ],
      }
  }

  focus(nextElement: IonInput) {
    nextElement.setFocus()
  }  
  
  async blur(nextElement: IonInput) {
    const h: HTMLInputElement = await nextElement.getInputElement()
    h.blur()
    this.ingresarConCorreo()
  }


  async ingresarConCorreo() {
    this.form.controls.email.markAsTouched()
    this.form.controls.password.markAsTouched()
    if (!this.form.valid) return
    await this.alertService.presentLoading()
    this.err = ''
    try {
      const correo = this.form.value.email.trim() + '@spot.com'
      const resp = await this.authService.loginWithEmail(correo, this.form.value.password)
      this.alertService.dismissLoading()
      if (resp) this.router.navigate(['/home'])
      else this.alertService.presentAlert('Usuario no registrado', 'Por favor registra una cuenta antes de ingresar')
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
    if (this.back) this.back.unsubscribe()
  }

}
