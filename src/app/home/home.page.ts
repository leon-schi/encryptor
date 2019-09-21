import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';

import { DbService } from '../services/db.service';
import { Collection } from '../services/model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  collections: Collection[];
  next: number;

  modalController: ModalController;
  db: DbService;

  loading: boolean = true;

  constructor(modalController: ModalController, db: DbService) {
    this.modalController = modalController;
    this.db = db;

    this.collections = [];
    this.next = 2;
  }

  ngOnInit() {
    this.db.initDatabase()
      .then(() => { this.readCollections(); })
      .catch((e) => { console.log(e); });
  }

  readCollections() {
    this.db.getCollecionNames().then((r) => { 
      this.collections = r; 
      this.loading = false;
    });
  }

  addItem() {
    this.collections.push(new Collection(this.next, 'new Collection ' + this.next, '99999'));
    this.next++;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage
    });
    return await modal.present();
  }

}
