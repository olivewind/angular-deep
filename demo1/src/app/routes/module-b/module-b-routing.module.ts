import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ModuleBPageAComponent,
} from './pages';

const routes: Routes = [
  {
    path: 'page-a/:id',
    component: ModuleBPageAComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuleBRoutingModule { }
