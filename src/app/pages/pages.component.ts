import {AfterViewInit, Compiler, Component, NgModule, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import { STYLE_MAPPING } from './style-mappings';
import {ElementType} from './element-types';

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
      this.setDefaultStyles();
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

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  generateTemplate(): Promise<string> {

    return new Promise(async (resolve, reject) => {

      const staticElementList = [];
      const multilineElementList = [];


      // setup static elements
      await this.asyncForEach(this.pages[0].staticElements, async (element) => {

        const fixedElement = document.createElement('div');

        const curId = `el${this.idCounter++}`;
        const height = element.resolution.bottom - element.resolution.top;
        const width = element.resolution.right - element.resolution.left;

        let curResolution = `margin-left: ${element.resolution.left}px; `;
        curResolution += `margin-top: ${element.resolution.top}px; `;
        curResolution += `position: absolute; `;
        curResolution += `height: ${height}px; `;
        curResolution += `width: ${width}px;`;

        let curClasses;
        if (element.settings && element.settings.fixed && element.settings.fixed.length > 0) {
          curClasses = element.settings.fixed;
        }
        this.setVariableStyles(element.settings.variable, curId);

        let content;
        if (element.body) {
          switch (element.body.type) {
            case this.TEXT: {
              if (element.body.content) {
                content = document.createTextNode(element.body.content);
                fixedElement.appendChild(content);
              }
              break;
            }
            case this.IMAGE: {
              const image = new Image();
              try {
                image.src = `data:image/png;base64, ${await this.getImage(element.body.content)}`;
                image.setAttribute('style', 'width: inherit;');
                fixedElement.appendChild(image);
              } catch (e) {

              }
            }
          }
        }

        fixedElement.setAttribute('style', curResolution);
        if (curClasses) {
          curClasses.forEach(elementClass => {
            if (elementClass) {
              fixedElement.classList.add(elementClass);
            }
          })
        }
        fixedElement.id = curId;

        staticElementList.push(fixedElement);
      });

      // setup multiline elements
      this.pages[0].multilineElements.forEach(element => {

        const height = element.resolution.bottom - element.resolution.top;
        const width = element.resolution.right - element.resolution.left;
        const multilineSettings = this.pages[0].multilineSettings;

        let curResolution = `margin-left: ${element.resolution.left}px; `;
        curResolution += `height: ${height}px; `;
        curResolution += `position: absolute; `;
        curResolution += `width: ${width}px;`;
        curResolution += 'background-color: yellow;'; // temporary
        curResolution += 'opacity: 0.5;'; // temporary


        // if multiline settings are passed
        if (multilineSettings && multilineSettings.margin && multilineSettings.numOfElements) {

          for (let i = 0; i < multilineSettings.numOfElements; i++) {
            const multilineElement = document.createElement('div');
            const marginTop = element.resolution.top + (multilineSettings.margin * i);
            multilineElement.setAttribute('style', curResolution + `margin-top: ${marginTop}px;`);
            multilineElementList.push(multilineElement);
          }
        } else {
          const multilineElement = document.createElement('div');
          multilineElement.setAttribute('style', curResolution + `margin-top: ${element.resolution.top}px;`);
          multilineElementList.push(multilineElement);
        }
      });

      const finalPage = document.createElement('div');
      finalPage.id = 'main';
      finalPage.className = 'page-container';

      staticElementList.forEach(element => {
        finalPage.appendChild(element);
      });

      multilineElementList.forEach(element => {
        finalPage.appendChild(element);
      });

      resolve(finalPage.outerHTML);
    });
  }

  generateStyleClasses(properties): string {

    const fixedClasses = properties.fixed.join(' ');
    const variableClasses = properties.variable;

    return fixedClasses;

  }

  setDefaultStyles(): void {
    const defaultStyles = `
    div { 
      display: flex;
      color: white;
      background-color: black;
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
    let url = 'http://localhost:3001/pages/';
    if (this.pageNumber) {
      url += `${this.pageNumber}`;
    }
    return await this.http.get(url).toPromise();
  }

  async getImage(imageName): Promise<any> {
    const url = 'http://localhost:8202/v1/api/getImage?imageName=';

    return await this.http.get(url + imageName).toPromise();
  }

}
