import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'modify-modal',
  templateUrl: 'modify-modal.page.html',
  styleUrls: ['modify-modal.page.scss'],
})
export class ModifyModalPage {
    @Input() name: string;
    @Input() value: string;

    constructor(private modalCtrl: ModalController) {}

    dismiss() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

}