import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-confirmar-pago',
  templateUrl: './confirmar-pago.page.html',
  styleUrls: ['./confirmar-pago.page.scss'],
})
export class ConfirmarPagoPage implements OnInit {

  hasNet = true

  @Input() total: number

  constructor(
    private modalCtrl: ModalController,
    private netService: NetworkService,
  ) { }

  ngOnInit() {
    this.netService.isConnected.subscribe(value => this.hasNet = value)
  }

  entregar() {
    if (!this.hasNet) return
    this.modalCtrl.dismiss(true)
  }

}
