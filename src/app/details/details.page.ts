import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { DbService } from '../services/db.service'
import { Collection } from 'src/app/services/model';
import { ModifyModalPage } from './modify-modal/modify-modal.page'

export type Attribute = {
    name: string,
    value: string
}

@Component({
  selector: 'app-details',
  templateUrl: 'details.page.html',
  styleUrls: ['details.page.scss'],
})
export class DetailsPage implements OnInit {
    private id: number;
    private showValues: boolean = false;
    collection: Collection;
    attributes: Attribute[] = null;

    constructor(private route: ActivatedRoute, private db: DbService, private modalCtrl: ModalController, private toastController: ToastController) {}

    ngOnInit() {
    this.route.paramMap.subscribe(params => {
            this.id = parseInt(params.get('id'));
            this.collection = this.db.getCollectionNameById(this.id);
            this.db.getCollecionById(this.id).then((collection) => { 
                this.attributes = JSON.parse(collection.value);
                this.collection = collection;
            });
        });
    }

    toggleVisibility() {
        this.showValues = !this.showValues;    
    }

    renderPassword(text: string) : string {
        if (this.showValues) return text;2
        return '●'.repeat(text.length);
    }

    insertAttribute(attribute: Attribute) {
        let i = this.attributes.indexOf(attribute);
        if (i === -1)
            this.attributes.push(attribute);
    }

    addNewAttribute() {
        let attribute: Attribute = {
            name: 'New Attribute',
            value: ''
        }
        this.presentModal(attribute);
    }

    async copyAttribute(attribute) {
        const toast = await this.toastController.create({
            message: '"' + attribute.name + '" copied to clipboard',
            duration: 2000
        });
        toast.present();
    }

    async presentModal(attribute) {
        const modal = await this.modalCtrl.create({
            component: ModifyModalPage,
            componentProps: {
                attribute: attribute,
                controller: this
            }
        });
        return await modal.present();
    }
}
