import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Attribute } from '../details.page'

@Component({
  selector: 'modify-modal',
  templateUrl: 'modify-modal.page.html',
  styleUrls: ['modify-modal.page.scss'],
})
export class ModifyModalPage implements OnInit {
    @Input() attribute: Attribute;
    @Input() controller: any;

    name: string;
    value: string;

    constructor(private modalCtrl: ModalController) {}

    ngOnInit() {
        this.name = this.attribute.name;
        this.value = this.attribute.value;
    }

    async save() {
        this.attribute.name = this.name;
        this.attribute.value = this.value;

        await this.controller.insertAttribute(this.attribute);
        this.dismiss();
    }

    async delete() {
        await this.controller.deleteAttribute(this.attribute);
        this.dismiss();
    }

    dismiss() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

}