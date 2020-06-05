import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirmar-pago',
  templateUrl: './confirmar-pago.page.html',
  styleUrls: ['./confirmar-pago.page.scss'],
})
export class ConfirmarPagoPage implements OnInit {


  @Input() total: number

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }

  entregar() {
    this.modalCtrl.dismiss(true)
  }

  regresar() {
    this.modalCtrl.dismiss()
  }

}
