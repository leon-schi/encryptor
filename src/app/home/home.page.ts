import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';

import { DbService } from '../services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  next: number = 2;

  loading: boolean = true;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private db: DbService) {}

  ngOnInit() {
    this.db.initDatabase()
      .then(() => { this.loading = false; })
      .catch((e) => { console.log(e); });
  }

  getCollections() {
    return this.db.getCollectionNames();
  }

  addItem2() {
    this.db.insertCollection('new Collection ' + this.next, "[]");
      this.next++;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage
    });
    return await modal.present();
  }

  async addItem(name: string) {
    this.db.insertCollection(name, "[]");
    this.next++;
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

}
