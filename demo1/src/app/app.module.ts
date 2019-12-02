import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RoutesModule } from './routes/routes.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    RoutesModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
