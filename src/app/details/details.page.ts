import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DbService } from '../services/db.service'
import { Collection } from 'src/app/services/model';
import { ModifyModalPage } from './modify-modal/modify-modal.page'

@Component({
  selector: 'app-details',
  templateUrl: 'details.page.html',
  styleUrls: ['details.page.scss'],
})
export class DetailsPage implements OnInit {
    private id: number;
    private showValues: boolean = false;
    collection: Collection;
    attributes = null;

    constructor(private route: ActivatedRoute, private db: DbService, private modalCtrl: ModalController) {}

    ngOnInit() {
    this.route.paramMap.subscribe(params => {
            this.id = parseInt(params.get('id'));
            this.collection = this.db.getCollectionNameById(this.id);
            this.db.getCollecionById(this.id).then((collection) => { 
                console.log(collection.value);
                this.attributes = JSON.parse(collection.value);
                this.collection = collection;
                console.log(this.attributes)
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

    async presentModal(attribute) {
        const modal = await this.modalCtrl.create({
            component: ModifyModalPage,
            componentProps: {
                name: attribute.name,
                value: attribute.value
            }
        });
        return await modal.present();
    }
}
