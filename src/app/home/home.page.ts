import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';
import { PwModalPage } from './set-pw-modal/set-pw-modal.page';

import { CollectionService } from '../services/collection.service';

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
    private collectionService: CollectionService) {}

  async ngOnInit() {
    let loadingPopup = await this.loadingController.create({ message: 'reading Collections' });
    await loadingPopup.present();

    this.collectionService.init()
      .then(() => { loadingPopup.dismiss(); })
      .catch((e) => { console.log(e); });
  }

  getCollections() {
    return this.collectionService.getCollectionNames();
  }

  async addItem(name: string) {
    this.collectionService.insertCollection(name, "[]");
    this.next++;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage
    });
    return await modal.present();
  }

  async presentPasswordModal() {
    const modal = await this.modalController.create({
      component: PwModalPage
    });
    return await modal.present();
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
          handler: (data) => { this.presentPasswordModal(); }
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
              handler: () => { this.presentModal() }
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
