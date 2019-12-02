import { NgModule } from '@angular/core';
import { ModuleBRoutingModule } from './module-b-routing.module';
import { ModuleBPageAComponent } from './pages';

const PAGES = [
  ModuleBPageAComponent,
];


@NgModule({
  imports: [
    ModuleBRoutingModule
  ],
  declarations: [
    ...PAGES
  ],
})
export class ModuleBModule { }
