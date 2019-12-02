import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ModuleAPageAComponent,
} from './pages';

const routes: Routes = [
  {
    path: 'page-a',
    component: ModuleAPageAComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuleARoutingModule { }
