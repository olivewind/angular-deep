import { NgModule } from '@angular/core';

import { RouteRoutingModule } from './routes-routing.module';

const PAGES = [
];

const COMPNENTS = [
];

@NgModule({
  imports: [
    RouteRoutingModule,
  ],
  declarations: [
    ...PAGES,
    ...COMPNENTS
  ],
})
export class RoutesModule { }
