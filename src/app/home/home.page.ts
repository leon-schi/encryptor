import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';

import { DbService } from '../services/db.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  next: number;

  modalController: ModalController;
  db: DbService;

  loading: boolean = true;

  constructor(modalController: ModalController, db: DbService) {
    this.modalController = modalController;
    this.db = db;

    this.next = 2;
  }

  ngOnInit() {
    this.db.initDatabase()
      .then(() => { this.loading = false; })
      .catch((e) => { console.log(e); });
  }

  getCollections() {
    return this.db.getCollectionNames();
  }

  addItem() {
    this.next++;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage
    });
    return await modal.present();
  }

}
