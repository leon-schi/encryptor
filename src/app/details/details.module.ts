import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DetailsPage } from './details.page';
import { ModifyModalPage } from './modify-modal/modify-modal.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: ':id',
        component: DetailsPage
      },
    ])
  ],
  entryComponents:[ModifyModalPage],
  declarations: [DetailsPage, ModifyModalPage]
})
export class DetailsPageModule {}
