import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { DetailsPage } from './details/details.page';
import { ModalPage } from './modal/modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }, {
        path: 'details/:id',
        component: DetailsPage
      },
    ])
  ],
  entryComponents:[ModalPage],
  declarations: [HomePage, DetailsPage, ModalPage]
})
export class HomePageModule {}
