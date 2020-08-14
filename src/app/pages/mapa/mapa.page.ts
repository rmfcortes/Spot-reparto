import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { GoogleMap, Marker, ILatLng, Environment, GoogleMapOptions, GoogleMaps, MarkerIcon } from '@ionic-native/google-maps/ngx';

import { UbicacionService } from 'src/app/services/ubicacion.service';
import { CommonService } from 'src/app/services/common.service';
import { FcmService } from 'src/app/services/fcm.service';

import { environment } from 'src/environments/environment';
import { Cliente } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {

  cliente: Cliente

  map: GoogleMap

  repartidorMaker: Marker
  clienteLatLng: ILatLng

  pinRepartidor = '../../../assets/img/repartidor.png';
  pinCasa = '../../../assets/img/pin.png';

  constructor(
    private platform: Platform,
    private location: Location, 
    private ubicacionService: UbicacionService,
    private commonService: CommonService,
    private fcmService: FcmService,
  ) { }

  ngOnInit() {
    this.fcmService.requestToken()
  }

  async ionViewDidEnter() {
    await this.platform.ready()
    this.cliente = await this.commonService.getClienteTemporal()
    this.clienteLatLng = {
      lat: this.cliente.direccion.lat,
      lng: this.cliente.direccion.lng
    }
    this.loadMap()
  }

  navigate() {
    const numbers = [this.cliente.direccion.lat, this.cliente.direccion.lng]
    this.ubicacionService.navigate(numbers)
  }

  loadMap() {
    if(this.map) this.map.clear()
    
    // This code is necessary for browser
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': environment.mapsApiKey,
      'API_KEY_FOR_BROWSER_DEBUG': environment.mapsApiKey
    })

    let mapOptions: GoogleMapOptions = {
      camera: {
         target: this.clienteLatLng,
         zoom: 17,
       },
       gestures: {
         zoom: true,
         rotate: true
       }
    }

    this.map = GoogleMaps.create('map_canvas', mapOptions)

    this.trackMe()

    const icon: MarkerIcon = {
      url: './assets/img/pin.png',
      size: {
        width: 40,
        height: 60
      }
    }

    this.map.addMarkerSync({
      icon,
      animation: 'DROP',
      position: {
        lat: this.cliente.direccion.lat,
        lng: this.cliente.direccion.lng
      }
    })
    // marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
    //   alert('clicked');
    // });
  }

  trackMe() {
    const icon: MarkerIcon = {
      url: './assets/img/repartidor.png',
      size: {
        width: 40,
        height: 60
      }
    }
    this.ubicacionService.ubicacion.subscribe(ubicacion => {
      const position: ILatLng = {
        lat: ubicacion.lat,
        lng: ubicacion.lng
      }
      if (!this.repartidorMaker) {
        this.repartidorMaker = this.map.addMarkerSync({
          icon,
          animation: 'DROP',
          position
        })
      } else {
        this.repartidorMaker.setPosition(position)
      }
      const markers: ILatLng[] = [position, this.clienteLatLng]
      this.map.moveCamera({
        target: markers,
        padding: 100
      })
    })
  }

  regresar() {
    this.commonService.removeFromStorage('cliente_temporal')
    this.location.back()
  }

}
