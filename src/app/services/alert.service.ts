import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  loader: any;

  constructor(
    public loadingCtrl: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

  async presentAlertRadio(titulo, msn, inputs) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: titulo,
        message: msn,
        inputs,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Asignar',
            handler: (data) => {
              resolve(data);
            }
          }
        ]
      });

      await alert.present();
    });
  }

  async presentAlert(titulo, msn) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msn,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertPrompt(titulo, placeholder) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: titulo,
        inputs: [
          {
            name: 'name1',
            type: 'text',
            placeholder
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Ok',
            handler: (data) => {
              resolve(data.name1);
            }
          }
        ]
      });
      await alert.present();
    });
  }

  async presentAlertConfirm(titulo, msn) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: titulo,
        message: msn,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(false);
            }
          },
          {
            text: 'Ok',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(true);
            }
          }
        ]
      });

      await alert.present();
    });
  }

  async presentLoading() {
    this.loader = await this.loadingCtrl.create({
     spinner: 'crescent'
    });
    return await this.loader.present();
  }

  dismissLoading() {
    this.loader.dismiss();
  }

}
