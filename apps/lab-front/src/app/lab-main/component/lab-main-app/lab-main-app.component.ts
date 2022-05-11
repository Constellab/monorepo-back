import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/lab-main-menu-link.class';
import {Observable, startWith} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabEnvStore} from '../../../lab-core/service/lab-env.store';
import {LabEnvironmentHelper} from '../../../lab-core/utils/lab-environment.helper';
import {LabAuthenticatedUserService} from '../../../lab-core/service/lab-authenticated-user.service';
import {LabRouterService} from '../../../lab-core/service/lab-router.service';
import {LabSystemService} from '../../../lab-core/service/lab-system.service';
import {Title} from '@angular/platform-browser';

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

  labName: string;

  constructor(private labEnvManager: LabEnvStore,
              private authenticatedUserService: LabAuthenticatedUserService,
              private systemService: LabSystemService,
              private titleService: Title) {
  }

  ngOnInit(): void {
    this.centralAppUrl = LabEnvironmentHelper.getCentralFrontAppUrl();
    this.authenticatedUserService.loadAuthenticatedUser();
    this.getLabInfo();

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

  private getLabInfo(): void {
    this.systemService.getSystemInfo().pipe(
      map(systemInfo => systemInfo.labName),
      startWith('Lab')).subscribe(
      labName => {
        this.labName = labName;
        this.titleService.setTitle(labName);
      });
  }
}
