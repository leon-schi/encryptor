import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { ModalPage } from './modal/modal.page';
import { PwModalPage } from './set-pw-modal/set-pw-modal.page';

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
        path: 'details',
        loadChildren: () => import('../details/details.module').then( m => m.DetailsPageModule)
      },
    ])
  ],
  entryComponents:[ModalPage, PwModalPage],
  declarations: [HomePage, ModalPage, PwModalPage]
})
export class HomePageModule {}
