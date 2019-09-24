import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController, NavController, AlertController, ActionSheetController } from '@ionic/angular';
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

    constructor(
        private route: ActivatedRoute, 
        private navController: NavController,
        private alertController: AlertController,
        private actionSheetController: ActionSheetController,
        private db: DbService, 
        private modalCtrl: ModalController, 
        private toastController: ToastController) {}

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

    private async updateCollection() {
        await this.db.updateCollection(
            this.collection.id,
            this.collection.name,
            JSON.stringify(this.attributes))
    }

    async insertAttribute(attribute: Attribute) {
        let i = this.attributes.indexOf(attribute);
        if (i === -1)
            this.attributes.push(attribute);

        await this.updateCollection();
    }

    async deleteAttribute(attribute: Attribute) {
        let i = this.attributes.indexOf(attribute);
        if (i > -1) {
            this.attributes.splice(i, 1);   
        }

        await this.updateCollection();
    }

    async deleteCollection() {
        await this.db.deleteCollection(this.collection.id);
        this.navController.back();
    }

    async renameCollection(newName: string) {
        this.collection.name = newName;
        await this.updateCollection();
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

    async presentDeleteCollectionAlert() {
        const alert = await this.alertController.create({
            header: 'Confirm',
            message: 'Are you sure to delete collection ' + this.collection.name + '?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                  text: 'Yes',
                  handler: () => { this.deleteCollection() }
                }
              ]
        });
        alert.present();
    }

    async presentActionSheet() {
        const actionSheet = await this.actionSheetController.create({
            header: 'Options',
            buttons: [
                {
                    text: 'Rename Collection',
                    icon: 'create',
                    handler: () => { this.presentRenameCollectionAlert(); }
                }, {
                    text: 'Cancel',
                    icon: 'close',
                    role: 'cancel'
                }
            ]
        });
        await actionSheet.present();
    }

    async presentRenameCollectionAlert() {
        const alert = await this.alertController.create({
            header: 'Rename ' + this.collection.name,
            inputs: [
            {
                name: 'Name',
                type: 'text',
                placeholder: this.collection.name
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
                    if (data.Name === "") return false;
                    this.renameCollection(data.Name);
                }
            }
            ]
        });

        await alert.present();
    }
}
