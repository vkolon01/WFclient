import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import { PageComponent } from './page/page.component';


@NgModule({
  declarations: [
    PagesComponent,
    PageComponent
  ],
  imports: [
    CommonModule,
    routing,
    HttpClientModule,
  ],
  exports: [
    PagesComponent
  ],
  providers: [
    HttpClient
  ]
})
export class PagesModule { }
