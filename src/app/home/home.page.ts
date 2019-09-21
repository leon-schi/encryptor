import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items: string[];
  next: number;
  modalController: ModalController;
  constructor(modalController: ModalController) {
    this.modalController = modalController;
    this.items = ['AWS'];
    this.next = 2;
  }

  addItem() {
    this.items.push('Item ' + this.next);
    this.next++;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage
    });
    return await modal.present();
  }

}
