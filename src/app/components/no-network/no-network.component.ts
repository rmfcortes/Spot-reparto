import { Component, OnInit, NgZone } from '@angular/core';

import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-no-network',
  templateUrl: './no-network.component.html',
  styleUrls: ['./no-network.component.scss'],
})
export class NoNetworkComponent implements OnInit {

  network = true

  constructor(
    private ngZone: NgZone,
    private netService: NetworkService,
  ) { }

  ngOnInit() {
    this.listenNet()
  }

  listenNet() {
    this.netService.isConnected.subscribe(resp => this.ngZone.run(() => resp ? this.network = true : this.network = false))
  }

}
