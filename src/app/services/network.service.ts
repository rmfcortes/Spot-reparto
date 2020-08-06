import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  public isConnected = new BehaviorSubject(true)
  disconnectSub: Subscription
  connectSub: Subscription

  constructor(
    private network: Network,
  ) { }

  checkNetStatus() {
    if (this.disconnectSub) this.disconnectSub.unsubscribe()
    this.disconnectSub = this.network.onDisconnect().subscribe(() => this.isConnected.next(false))

    if (this.connectSub) this.connectSub.unsubscribe()
    this.connectSub = this.network.onConnect().subscribe(() => this.isConnected.next(true))

  }

  stopCheckNet() {
    if (this.disconnectSub) this.disconnectSub.unsubscribe()
    if (this.connectSub) this.connectSub.unsubscribe()
  }
}
