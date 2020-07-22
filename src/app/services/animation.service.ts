import { Injectable } from '@angular/core';

import { GestureController } from '@ionic/angular';
import { createAnimation, Animation, Gesture } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})

export class AnimationService {

  pulseAnim: Animation
  arrastraGesture: Gesture

  constructor(
    private gestureCtrl: GestureController,
  ) { }

  arrastra(boton: HTMLElement, width_caja: number) {
    return new Promise((resolve, reject) => {      
      let currentX = 0
      this.arrastraGesture = this.gestureCtrl.create({
        el: boton,
        gestureName: 'arrastra',
        onMove: ev => {
          if (ev.deltaX > 0 && ev.deltaX < width_caja && width_caja) {
            boton.style.transform = `translateX(${ev.deltaX}px)`
            currentX = ev.currentX
          }
        },
        onEnd: ev => {
          if (currentX - 55 >= (width_caja + 55) * .8) resolve()
          boton.style.transform = `translateX(${0}px)`
        }
      })
      this.arrastraGesture.enable(true)
    })
  }

  stopArrastra() {
    this.arrastraGesture.destroy()
  }

  pulse(el: HTMLElement) {
    this.pulseAnim = createAnimation()
    .addElement(el)
    .duration(1000)
    .iterations(3)
    .keyframes([
      { offset: 0, transform: 'scale(1)', opacity: '.8' },
      { offset: 0.5, transform: 'scale(1.15)', opacity: '1' },
      { offset: 1, transform: 'scale(1)', opacity: '1' }
    ])
    this.pulseAnim.play()
  }

  stopPulse() {
    this.pulseAnim.stop()
    this.pulseAnim.destroy()
  }

}

export interface Gestures {
  idPedido: string
  gesture: Gesture
}
