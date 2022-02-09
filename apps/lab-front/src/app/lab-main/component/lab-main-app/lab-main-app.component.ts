import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/lab-main-menu-link.class';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabEnvStore} from '../../../lab-core/service/lab-env.store';
import {LabEnvironmentHelper} from '../../../lab-core/utils/lab-environment.helper';
import {LabAuthenticatedUserService} from '../../../lab-core/service/lab-authenticated-user.service';

@Component({
  selector: 'lab-main-app',
  templateUrl: './lab-main-app.component.html',
  styleUrls: ['./lab-main-app.component.scss']
})
export class LabMainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  centralAppUrl: string;

  constructor(private labEnvManager: LabEnvStore,
              private authenticatedUserService: LabAuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.centralAppUrl = LabEnvironmentHelper.getCentralFrontAppUrl();
    this.authenticatedUserService.loadAuthenticatedUser();
  }

  get toolbarColorClass(): Observable<string> {
    return this.labEnvManager.getLabEnvironment$().pipe(
      map(env => env === 'prod' ? 'g-card-background' : 'g-accent-background')
    );
  }

}
