import {AfterViewInit, Compiler, Component, NgModule, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import { STYLE_MAPPING } from './style-mapping';
import {ElementType} from './element-types';
// import {ConfigService, LoggingService} from "as-ng-common-services/dist";

@Component({
  selector: 'app-pages',
  template: '<div #container></div>',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, AfterViewInit {

  @ViewChild('container', {read: ViewContainerRef, static: false}) container: ViewContainerRef;

  private pages = [];
  private pageNumber;

  IMAGE = ElementType[ElementType.I];
  TEXT = ElementType[ElementType.T];
  UNUSED = ElementType[ElementType.U];
  MOVIE = ElementType[ElementType.M];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private compiler: Compiler
  ) { }

  ngOnInit() {
    this.pageNumber = this.route.snapshot.paramMap.get('pageNumber');
  }

  async ngAfterViewInit() {

    try {
      const res = await this.getPage();
      const response = res as any;
      this.pages.push(response);

      // Must clear cache.
      this.compiler.clearCache();

      const pageSettings = this.pages[0].pageSettings;

      // Define the component using Component decorator.
      const component = Component({
        template: this.generateTemplate(),
        styles: this.generatePageStyles(pageSettings)
      })(class {});

      // Define the module using NgModule decorator.
      const module = NgModule({
        declarations: [component]
      })(class {});

      // Asynchronously (recommended) compile the module and the component.
      this.compiler.compileModuleAndAllComponentsAsync(module)
        .then(factories => {
          // Get the component factory.
          const componentFactory = factories.componentFactories[0];
          // Create the component and add to the view.
          const componentRef = this.container.createComponent(componentFactory);
        });
    } catch (e) {


      // Must clear cache.
      this.compiler.clearCache();

      // Define the component using Component decorator.
      const component = Component({
        template: `<div>error</div>`,
        styles: []
      })(class {});

      // Define the module using NgModule decorator.
      const module = NgModule({
        declarations: [component]
      })(class {});

      // Asynchronously (recommended) compile the module and the component.
      this.compiler.compileModuleAndAllComponentsAsync(module)
        .then(factories => {
          // Get the component factory.
          const componentFactory = factories.componentFactories[0];
          // Create the component and add to the view.
          const componentRef = this.container.createComponent(componentFactory);
        });

      console.log(e);
    }
  }

  generateTemplate(): string {

    const staticElementList = [];
    const multilineElementList = [];


    // setup static elements
    this.pages[0].staticElements.forEach( element => {

      const height = element.resolution.bottom - element.resolution.top;
      const width = element.resolution.right - element.resolution.left;

      const resolutionStyles = `margin-left: ${element.resolution.left}px; margin-top: ${element.resolution.top}px; position: absolute; height: ${height}px; width: ${width}px;`;

      let styles = '';
      if (element.settings) {
        styles = this.generateStyles(element.settings);
      }

      let content = '';
      if (element.body) {
        switch (element.body.type) {
          case this.TEXT: {
            if (element.body.content) {
              content = element.body.content;
            }
          }
        }
      }

      staticElementList.push(`<div style="${resolutionStyles} ${styles} ">  ${content} </div>`);
    });

    // setup multiline elements
    this.pages[0].multilineElements.forEach( element => {

      const height = element.resolution.bottom - element.resolution.top;
      const width = element.resolution.right - element.resolution.left;
      const backgroundColour = 'yellow';
      const multilineSettings = this.pages[0].multilineSettings;

      // if multiline settings are passed
      if (multilineSettings && multilineSettings.margin && multilineSettings.numOfElements) {

        for (let i = 0; i < multilineSettings.numOfElements; i++) {
          const marginTop = element.resolution.top + (multilineSettings.margin * i);
          multilineElementList.push(`<div style="margin-left: ${element.resolution.left}px; margin-top: ${marginTop}px; position: absolute; height: ${height}px; width: ${width}px; background-color: ${backgroundColour}; opacity: 0.5;">  </div>`);
        }
      } else {
        multilineElementList.push(`<div style="margin-left: ${element.resolution.left}px; margin-top: ${element.resolution.top}px; position: absolute; height: ${height}px; width: ${width}px; background-color: ${backgroundColour}; opacity: 0.5;">  </div>`);
      }
    });

    let finalPage = '<div class="page-container">';

    staticElementList.forEach(element => {
      finalPage += element;
    });

    multilineElementList.forEach(element => {
      finalPage += element;
    });

    finalPage += '</div>';

    return finalPage;
  }

  generateStyles(properties): string {
    let style = '';
    for (const property in properties) {
      if (STYLE_MAPPING[property]) {
        const styleName = STYLE_MAPPING[property].style;
        let styleValue = properties[property];

        // add possible prefix and suffix
        if (STYLE_MAPPING[property].prefix) {
          styleValue = STYLE_MAPPING[property].prefix + styleValue;
        }
        if (STYLE_MAPPING[property].suffix) {
          styleValue = styleValue + STYLE_MAPPING[property].suffix;
        }

        style += `${styleName}: ${styleValue};`;

      } else {

      }
    }
    return style;
  }

  generatePageStyles(properties: object): string[] {

    const styles = [];
    let style = '.page-container {';
    for (const property in properties) {
      if (STYLE_MAPPING[property]) {
        const styleName = STYLE_MAPPING[property].style;
        let styleValue = properties[property];

        // add possible prefix and suffix
        if (STYLE_MAPPING[property].prefix) {
          styleValue = STYLE_MAPPING[property].prefix + styleValue;
        }
        if (STYLE_MAPPING[property].suffix) {
          styleValue = styleValue + STYLE_MAPPING[property].suffix;
        }
        style += `${styleName}: ${styleValue};`;

        styles.push(`.page-container {height: ${this.pages[0].resolution.y}px; width: ${this.pages[0].resolution.x}px`);

      }
    }
    style += '}';
    styles.push(style);
    return styles;
  }

  async getPage(): Promise<any> {
    // return this.http.get(this.config.getServiceUrl('page-service', 'pages'))
    let url = 'http://localhost:3001/pages';
    if (this.pageNumber) {
      url += `/${this.pageNumber}`;
    }
    return await this.http.get(url).toPromise();
  }

}
