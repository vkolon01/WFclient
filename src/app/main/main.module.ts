import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MainComponent} from './main.component';
import {routing} from './main-routing.module';


@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    MainComponent
  ]
})
export class MainModule { }
