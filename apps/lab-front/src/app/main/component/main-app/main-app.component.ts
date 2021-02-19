import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/main-menu-link.class';
import {DocumentationBrick, documentationBricks} from '../../utils/documentation-link.class';

@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  documentationBricks: DocumentationBrick[] = documentationBricks;

  constructor() {
  }

  ngOnInit(): void {
  }

}
