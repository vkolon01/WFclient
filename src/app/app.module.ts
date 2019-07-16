import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonServicesModule } from 'as-ng-common-services/dist';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';
import {MainModule} from "./main/main.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainModule,
    PagesModule,
    CommonServicesModule.forRoot({
      configSource: `${window.location.protocol}//${window.location.host}/api-dependencies.json`
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
