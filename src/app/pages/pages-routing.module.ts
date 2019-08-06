import {RouterModule, Routes} from "@angular/router";
import {PagesComponent} from "./pages.component";


export const routes: Routes = [
  {
    path: 'test-page',
    component: PagesComponent
  },
  {
    path: 'test-page/:pageNumber',
    component: PagesComponent
  }
];

export const routing = RouterModule.forChild(routes);
