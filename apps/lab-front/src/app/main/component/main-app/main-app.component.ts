import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/main-menu-link.class';
import {DocumentationBrick, getDocumentationBricks} from '../../utils/documentation-link.class';
import {EnvironmentHelper} from '../../../core/utils/environment.helper';
import {Observable} from 'rxjs';
import {ThemePalette} from '@angular/material/core';
import {map} from 'rxjs/operators';
import {AuthenticationService} from '../../../core/service/authentication.service';
import {Router} from '@angular/router';
import {constLoginRoute} from '../../../core/utils/base-route';
import {LabEnvStore} from '../../../core/service/lab-env.store';

@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  documentationBricks: DocumentationBrick[];

  codeServerUrl: string;

  constructor(private labEnvManager: LabEnvStore,
              private authenticationService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.documentationBricks = getDocumentationBricks();
    this.codeServerUrl = EnvironmentHelper.getCodeServerUrl();
  }

  get toolbarColor(): Observable<ThemePalette> {
    return this.labEnvManager.getLabEnvironment$().pipe(
      map(env => env === 'prod' ? 'primary' : 'accent')
    );
  }

  logout(): void {
    this.authenticationService.logout().subscribe(
      () => this.router.navigate([constLoginRoute])
    );
  }
}
