import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController, NavController, AlertController, ActionSheetController, LoadingController } from '@ionic/angular';
import { CollectionService } from '../services/collection.service'
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
    loading: boolean = true;
    collection: Collection;
    attributes: Attribute[] = null;

    constructor(
        private route: ActivatedRoute, 
        private navController: NavController,
        private alertController: AlertController,
        private actionSheetController: ActionSheetController,
        private collectionService: CollectionService,
        private loadingController: LoadingController,
        private modalCtrl: ModalController, 
        private toastController: ToastController) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.loading = true;
            this.id = parseInt(params.get('id'));
            this.collection = this.collectionService.getCollectionNameById(this.id);
            this.collectionService.getCollecionById(this.id).then((collection) => { 
                this.attributes = JSON.parse(collection.value);
                this.collection = collection;
                this.loading = false;
            });
        })
    }

    noAttributes() {
        return this.attributes != null && this.attributes.length == 0;
    }

    toggleVisibility() {
        this.showValues = !this.showValues;    
    }

    renderPassword(text: string) : string {
        if (this.showValues) return text;2
        return '●'.repeat(text.length);
    }

    private async updateCollection() {
        await this.collectionService.updateCollection(
            this.collection.id,
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
        await this.collectionService.deleteCollection(this.collection.id);
        this.navController.back();
    }

    async renameCollection(newName: string) {
        this.collection.name = newName;
        await this.collectionService.renameCollection(this.collection.id, newName);
    }

    addNewAttribute() {
        let attribute: Attribute = {
            name: 'New Attribute',
            value: ''
        }
        this.presentModal(attribute, true);
    }

    async copyAttribute(attribute) {
        const toast = await this.toastController.create({
            message: '"' + attribute.name + '" copied to clipboard',
            duration: 2000
        });
        toast.present();
    }

    async presentModal(attribute, creation) {
        const modal = await this.modalCtrl.create({
            component: ModifyModalPage,
            componentProps: {
                attribute: attribute,
                controller: this,
                creation: creation
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
