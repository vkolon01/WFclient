import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  private _page;

  @Input()
  set page(value) {
    this._page = value;

  }

  constructor() { }

  ngOnInit() {

    console.log(this._page);

  }

}
