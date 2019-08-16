import {AfterViewInit, Compiler, Component, NgModule, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import { STYLE_MAPPING } from './style-mappings';
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
  private idCounter = 0;

  private pageStyles = '';

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

      // setting up main container styles
      const pageSettings = this.pages[0].pageSettings;
      const mainPageId = 'main';
      this.setFixedStyles();
      this.setVariableStyles(pageSettings.variable, mainPageId);
      this.pageStyles += `.page-container {height: ${this.pages[0].resolution.y}px; width: ${this.pages[0].resolution.x}px}`;

      // Define the component using Component decorator.
      const component = Component({
        template: await this.generateTemplate(),
        styles: [this.pageStyles]
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

  generateTemplate(): Promise<string> {

    return new Promise((resolve, reject) => {

      const staticElementList = [];
      const multilineElementList = [];


      // setup static elements
      this.pages[0].staticElements.forEach( element => {

        const curId = `el${this.idCounter++}`;

        const height = element.resolution.bottom - element.resolution.top;
        const width = element.resolution.right - element.resolution.left;

        const curResolution = `margin-left: ${element.resolution.left}px; margin-top: ${element.resolution.top}px; position: absolute; height: ${height}px; width: ${width}px;`;

        const curClasses = this.generateStyleClasses(element.settings);
        this.setVariableStyles(element.settings.variable, curId);

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

        staticElementList.push(`<div id="${curId}" class="${curClasses}" style="${curResolution}">  ${content} </div>`);
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

      let finalPage = '<div id="main" class="page-container">';

      staticElementList.forEach(element => {
        finalPage += element;
      });

      multilineElementList.forEach(element => {
        finalPage += element;
      });

      finalPage += '</div>';

      resolve(finalPage);
    });
  }

  generateStyleClasses(properties): string {

    const fixedClasses = properties.fixed.join(' ');
    const variableClasses = properties.variable;

    return fixedClasses;

  }

  setFixedStyles(): void {
    const defaultStyles = `
    div { 
      display: flex;
      color: white;
      box-sizing: border-box;
      border-width: 6px;
      font-size: 30px;
      font-family: Arial;
    }
    .TFBD { font-weight: bold; }
    .TFTS { font-style: italic; }
    .TFUL { text-decoration: underline; }
    .OSVT { align-items: flex-start; }
    .OSVC { align-items: center; }
    .OSVB { align-items: flex-end; }
    .OSHL { justify-content: flex-start; }
    .OSHC { justify-content: center; }
    .OSHR { justify-content: flex-end; }
    .BSOS { border-style: outset }
    .BSIS { border-style: inset }
    .BSSO { border-style: solid }
    `;

    this.pageStyles += defaultStyles;
  };

  setVariableStyles(properties, id): void {
    let styles = `#${id}{`;

    for (const property in properties) {
      if (property && STYLE_MAPPING[property]) {
        const valuesArray = properties[property].split(',');
        let style = STYLE_MAPPING[property];
        valuesArray.forEach(value => {
          style = style.replace('{{v}}', value);
        });

        styles += style;
      }
    }

    styles += '} \n';
    this.pageStyles += styles;
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
