import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'login-modal',
  templateUrl: 'modal.page.html',
  styleUrls: ['modal.page.scss'],
})
export class ModalPage {
    modalCtrl: ModalController;
    constructor(modalCtrl: ModalController) {
        this.modalCtrl = modalCtrl;
    }

    dismiss() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }
}