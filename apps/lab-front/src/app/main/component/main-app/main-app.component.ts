import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/main-menu-link.class';
import {DocumentationBrick, documentationBricks} from '../../utils/documentation-link.class';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  documentationBricks: DocumentationBrick[] = documentationBricks;

  juptyterLabUrl: string = environment.jupyterLabUrl;

  constructor() {
  }

  ngOnInit(): void {
  }

}
