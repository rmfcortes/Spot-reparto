import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Permisos } from '../interfaces/permisos.interface';


@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  permisos_value: Permisos = {
    gps: true,
    fcm: true,
    token: true,
    location: true,
  }

  permisos = new BehaviorSubject<Permisos>(this.permisos_value)

  constructor(
    private diagnostic: Diagnostic,
    private db: AngularFireDatabase,
    private locationAccuracy: LocationAccuracy,
    private uidService: UidService,
  ) { }

  //Check permisos Guard

  checkPermisos(): Promise<boolean> {
    return new Promise((resolve, reject) => {      
      if (
        this.permisos_value.gps &&
        this.permisos_value.fcm &&
        this.permisos_value.token &&
        this.permisos_value.location
      ) return resolve(true)
      Promise.all([
        this.isLocationAuthorized,
        this.isRemoteNotificationsEnabled(),
        this.isGpsLocationEnabled(),
        this.getToken(),
      ])
      .then(() => {
        if (
          this.permisos_value.gps &&
          this.permisos_value.fcm &&
          this.permisos_value.token &&
          this.permisos_value.location
        ) return resolve(true)
        return resolve(false)
      })
      .catch(err => reject(err))
    });
  }

  getToken(): Promise<boolean>  {
    return new Promise((resolve, reject) => {
     const uid = this.uidService.getUid();
     const tokSub = this.db.object(`repartidores_tokens/${uid}/token`).valueChanges().subscribe((token: string) => {
       tokSub.unsubscribe();
       if (token) {
         resolve(true)
         this.permisos_value.token = true
         this.permisos.next(this.permisos_value)
       }
       else {
        this.permisos_value.token = false
        this.permisos.next(this.permisos_value)
        resolve(false)
       }
     });
    });
  }

  // Check if application having GPS access permission
  isLocationAuthorized(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.isLocationAuthorized()
      .then(status => {
        this.permisos_value.location = status
        this.permisos.next(this.permisos_value)
        resolve(status)
      })
      .catch(err => reject(err))
    });
  }

  isRemoteNotificationsEnabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.isRemoteNotificationsEnabled()
      .then(resp => {
        this.permisos_value.fcm = resp
        this.permisos.next(this.permisos_value)
        resolve(resp)
      })
      .catch(err => reject(err))
    });
  }

  isGpsLocationEnabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.isGpsLocationEnabled() // For high accuracy
      .then(resp => {
        resolve(resp)
        this.permisos_value.gps = resp
        this.permisos.next(this.permisos_value)
      })
      .catch(err => reject(err))
    });
  }

  // Requests

  requestLocationAuthorization(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.diagnostic.requestLocationAuthorization()
      .then(status => {
        console.log(status);
        switch(status){
          case this.diagnostic.permissionStatus.NOT_REQUESTED:
              console.log("Permission not requested");
              resolve(false)
              break;
          case this.diagnostic.permissionStatus.GRANTED:
              console.log("Permission granted");
              resolve(true)
              break;
          case this.diagnostic.permissionStatus.DENIED_ONCE:
              console.log("Permission denied");
              resolve(false)
              break;
          case this.diagnostic.permissionStatus.DENIED_ALWAYS:
              console.log("Permission permanently denied");
              resolve(false)
              break;
      }
      })
      .catch(err => reject(err))
    });
  }

  requestHighAccuracyLocation(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(() => resolve(true))
      .catch(err => reject(err))
    });
  }

}
