import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'pw-modal',
  templateUrl: 'set-pw-modal.page.html',
  styleUrls: ['set-pw-modal.page.scss'],
})
export class PwModalPage {
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