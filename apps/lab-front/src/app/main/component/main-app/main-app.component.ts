import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/main-menu-link.class';
import {DocumentationBrick, getDocumentationBricks} from '../../utils/documentation-link.class';
import {EnvironmentHelper} from '../../../core/utils/environment.helper';

@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  documentationBricks: DocumentationBrick[];

  codeServerUrl: string;

  constructor() {
  }

  ngOnInit(): void {
    this.documentationBricks = getDocumentationBricks();
    this.codeServerUrl = EnvironmentHelper.getCodeServerUrl();
  }

}
