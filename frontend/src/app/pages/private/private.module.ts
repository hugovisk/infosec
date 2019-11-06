import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import {
  MatButtonModule,
  MatToolbarModule,
  MatCardModule, 
  MatIconModule
} from '@angular/material';
import { PrivatePage } from './private.page';

const routes: Routes = [
  {
    path: '',
    component: PrivatePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule
  ],
  declarations: [PrivatePage]
})
export class PrivatePageModule {}
