import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModuleAPageAComponent } from './module-a/pages';
import { ModuleBPageAComponent } from './module-b/pages';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'module-a/page-a',
    pathMatch: 'full'
  },
  {
    path: 'module-a',
    loadChildren: () => import('./module-a/module-a.module').then(m => m.ModuleAModule),
  },
  {
    path: 'module-b',
    loadChildren: () => import('./module-b/module-b.module').then(m => m.ModuleBModule),
  },
  {
    path: '**',
    redirectTo: '/module-a/page-a'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes, {
      useHash: true,
    }
    )],
  exports: [RouterModule],
})
export class RouteRoutingModule { }
