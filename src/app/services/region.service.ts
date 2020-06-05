import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { CommonService } from './common.service';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class RegionService {

  constructor(
    private db: AngularFireDatabase,
    private commonService: CommonService,
    private uidService: UidService,
  ) { }

    // Check Region

    checkRegion(): Promise<boolean> {
      return new Promise(async (resolve, reject) => {
        let region;
        region = this.uidService.getRegion()
        if (region) return resolve(true)
        region = await this.getRegion()
        if (region) return resolve(true)
        region = await this.getRegionDB()
        if (region) return resolve(true)
        return resolve(false)
      })
    }
  
    getRegion(): Promise<boolean> {
      return new Promise (async (resolve, reject) => {
        const region = await this.commonService.getVariableFromStorage('region')
        if (region) {
          this.uidService.setRegion(region)
          resolve(true)
        } else resolve(false)
      });
    }
  
    getRegionDB(): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const uid = this.uidService.getUid()
        console.log(uid)
        const regSub = this.db.object(`regiones_repartidores_asociados/${uid}`).valueChanges().subscribe((region: string) => {
          regSub.unsubscribe()

          if (region) {
            this.commonService.setVariableToStorage('region', region)
            this.uidService.setRegion(region)
            resolve(true)
          } else resolve(false)
        }, err => {
          console.log(err)
          resolve(false)
        })
        
      });
    }


}
