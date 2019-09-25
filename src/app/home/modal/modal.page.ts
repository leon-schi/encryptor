import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EncryptionService } from '../../services/encryption.service'

@Component({
  selector: 'login-modal',
  templateUrl: 'modal.page.html',
  styleUrls: ['modal.page.scss'],
})
export class ModalPage {
    password: string = '';
    errorMessage: string = null;
    constructor(private modalCtrl: ModalController, private encryptor: EncryptionService) {}

    verify() {
        this.encryptor.logIn(this.password).then((success) => {
            if (success) this.dismiss();
            else {
                this.password = '';
                this.errorMessage = 'wrong password'
            }
        });
    }

    dismiss() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }
}