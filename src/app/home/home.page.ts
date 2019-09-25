import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';
import { PwModalPage } from './set-pw-modal/set-pw-modal.page';

import { CollectionService } from '../services/collection.service';
import { EncryptionService } from '../services/encryption.service';
import { Collection } from '../services/model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  next: number = 2;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private collectionService: CollectionService,
    private encryptionService: EncryptionService) {}

  async ngOnInit() {
    await this.forcePassword();
    await this.forceAuthentification();
    await this.loadCollections();
  }

  private async forcePassword() {
    let masterPasswordSet: boolean = await this.encryptionService.isMasterPasswordSet();
    if (!masterPasswordSet)
      await this.presentPasswordModal(true);
  }

  private async forceAuthentification() {
    if (!this.encryptionService.isAuthenticated())
      await this.presentAuthenticationModal();
  }

  private async loadCollections() {
    let loadingPopup = await this.loadingController.create({ message: 'reading Collections' });
    await loadingPopup.present();

    this.collectionService.init()
      .then(() => { loadingPopup.dismiss(); })
      .catch((e) => { console.log(e); });
  }

  getCollections(): Collection[] {
    return this.collectionService.getCollectionNames();
  }

  canDecrypt(collection: Collection): boolean {
    return this.encryptionService.canDecrypt(collection);
  }

  async addItem(name: string) {
    this.collectionService.insertCollection(name, "[]");
    this.next++;
  }

  async presentAuthenticationModal() {
    const modal = await this.modalController.create({
      component: ModalPage,
      backdropDismiss: false
    });
    await modal.present();
    return modal.onDidDismiss();
  }

  async presentPasswordModal(initial = false) {
    const modal = await this.modalController.create({
      component: PwModalPage,
      backdropDismiss: !initial,
      componentProps: {
        initial: initial
      }
    });
    await modal.present();
    return modal.onDidDismiss();
  }

  async presentAddItemAlert() {
    const alert = await this.alertController.create({
      header: 'Add a new Collection',
      inputs: [
        {
          name: 'Name',
          type: 'text',
          placeholder: 'new Collection'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Ok',
          handler: (data) => {
            if (data.Name === "") return false
            this.addItem(data.Name);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentWrongPasswordAlert() {
    const alert = await this.alertController.create({
      header: 'Wrong Password!',
      message: 'The password you entered is incorrect.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentPasswordAlert() {
    const alert = await this.alertController.create({
      header: 'Enter current Password',
      inputs: [
        {
          name: 'Password',
          type: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Ok',
          handler: (data) => {
            this.encryptionService.logIn(data.Password).then((success) => {
              if (success)
                this.presentPasswordModal();
              else
                this.presentWrongPasswordAlert();
            }) 
          }
        }
      ]
    });

    await alert.present();
  }

  async presentSettingsActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [
          {
              text: 'Change Password',
              icon: 'create',
              handler: () => { this.presentPasswordAlert();  }
          }, {
              text: 'Log Out',
              icon: 'log-out',
              handler: () => { this.presentAuthenticationModal() }
          }, {
              text: 'Rate this App',
              icon: 'star',
              handler: () => {  }
          },
          {
              text: 'Cancel',
              icon: 'close',
              role: 'cancel'
          }
        ]
    });
    await actionSheet.present();
  }
}
