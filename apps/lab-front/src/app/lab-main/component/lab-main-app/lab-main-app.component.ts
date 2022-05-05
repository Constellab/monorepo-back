import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/lab-main-menu-link.class';
import {Observable, startWith} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabEnvStore} from '../../../lab-core/service/lab-env.store';
import {LabEnvironmentHelper} from '../../../lab-core/utils/lab-environment.helper';
import {LabAuthenticatedUserService} from '../../../lab-core/service/lab-authenticated-user.service';
import {LabRouterService} from '../../../lab-core/service/lab-router.service';
import {LabSystemService} from '../../../lab-core/service/lab-system.service';

@Component({
  selector: 'lab-main-app',
  templateUrl: './lab-main-app.component.html',
  styleUrls: ['./lab-main-app.component.scss']
})
export class LabMainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  centralAppUrl: string;

  menuExpanded: boolean = false;

  appRoute = LabRouterService.getAppRoute();

  labName$: Observable<string>;

  constructor(private labEnvManager: LabEnvStore,
              private authenticatedUserService: LabAuthenticatedUserService,
              private systemService: LabSystemService) {
  }

  ngOnInit(): void {
    this.centralAppUrl = LabEnvironmentHelper.getCentralFrontAppUrl();
    this.authenticatedUserService.loadAuthenticatedUser();
    this.labName$ = this.systemService.getSystemInfo().pipe(
      map(systemInfo => systemInfo.labName),
      startWith('Lab'),
    )
  }

  get toolbarColorClass(): Observable<string> {
    return this.labEnvManager.getLabEnvironment$().pipe(
      map(env => env === 'prod' ? 'g-card-background' : 'g-accent-background')
    );
  }

  get navButtonClass(): string {
    return this.menuExpanded ? 'nav-button-large' : 'nav-button-small';
  }

  toggleMenu(): void {
    this.menuExpanded = !this.menuExpanded;
  }
}
