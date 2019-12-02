import { NgModule } from '@angular/core';
import { ModuleARoutingModule } from './module-a-routing.module';
import { ModuleAPageAComponent } from './pages';

const PAGES = [
  ModuleAPageAComponent,
];


@NgModule({
  imports: [
    ModuleARoutingModule
  ],
  declarations: [
    ...PAGES
  ],
})
export class ModuleAModule { }
