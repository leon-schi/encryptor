import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EncryptionService } from '../../services/encryption.service'

@Component({
  selector: 'pw-modal',
  templateUrl: 'set-pw-modal.page.html',
  styleUrls: ['set-pw-modal.page.scss'],
})
export class PwModalPage {
    @Input() initial: boolean;

    password: string = '';
    repetition: string = '';
    errorMessage: string = null;
    loading: boolean = false;

    constructor(private modalCtrl: ModalController, private encryptor: EncryptionService) {}

    save() {
        if (this.password === '')
            this.errorMessage = "Please enter a non-empty password"
        else if (this.password !== this.repetition)
            this.errorMessage = "The passwords you entered don't match"
        else {
            this.loading = true;
            this.errorMessage = null;
            this.encryptor.setMasterPassword(this.password)
                .then(() => {this.dismiss()})
                .catch(() => {this.loading = false});
        }
    }

    dismiss() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }
}