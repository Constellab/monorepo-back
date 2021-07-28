import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/main-menu-link.class';
import {DocumentationBrick, getDocumentationBricks} from '../../utils/documentation-link.class';
import {EnvironmentHelper} from '../../../core/utils/environment.helper';
import {Observable} from 'rxjs';
import {ThemePalette} from '@angular/material/core';
import {LabEnvironmentService} from '../../../core/service/lab-environment.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  documentationBricks: DocumentationBrick[];

  codeServerUrl: string;

  constructor(private labEnvironmentService: LabEnvironmentService) {
  }

  ngOnInit(): void {
    this.documentationBricks = getDocumentationBricks();
    this.codeServerUrl = EnvironmentHelper.getCodeServerUrl();
  }

  get toolbarColor(): Observable<ThemePalette>{
    return this.labEnvironmentService.getLabEnvironment$().pipe(
      map(env => env === 'prod' ? 'primary': 'accent')
    )
  }
}
