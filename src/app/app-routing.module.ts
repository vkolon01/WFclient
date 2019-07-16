import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'test-page',
    redirectTo: 'test-page'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'test-page'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
