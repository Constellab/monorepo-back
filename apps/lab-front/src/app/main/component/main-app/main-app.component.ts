import { Component, OnInit } from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/main-menu-link.class';

@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[]= mainMenuLinks;

  constructor() { }

  ngOnInit(): void {
  }

}
