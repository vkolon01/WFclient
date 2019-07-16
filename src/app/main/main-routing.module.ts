import {RouterModule, Routes} from "@angular/router";
import {MainComponent} from "./main.component";


export const routes: Routes = [
  {
    path: 'test',
    component: MainComponent
  }
];

export const routing = RouterModule.forChild(routes);
