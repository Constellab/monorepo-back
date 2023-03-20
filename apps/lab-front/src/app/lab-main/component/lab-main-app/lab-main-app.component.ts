import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/lab-main-menu-link.class';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabEnvStore} from '../../../lab-core/service/lab-env.store';
import {LabEnvironmentHelper} from '../../../lab-core/utils/lab-environment.helper';
import {LabAuthenticatedUserService} from '../../../lab-core/service/lab-authenticated-user.service';
import {LabRouterService} from '../../../lab-core/service/lab-router.service';
import {LabSystemService} from '../../../lab-core/service/lab-system.service';
import {Title} from '@angular/platform-browser';
import {LabSystemInfo} from '../../../lab-core/model/global/lab-system.class';

@Component({
  selector: 'lab-main-app',
  templateUrl: './lab-main-app.component.html',
  styleUrls: ['./lab-main-app.component.scss']
})
export class LabMainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  centralAppUrl: string;

  menuExpanded: boolean = true;

  appRoute = LabRouterService.getAppRoute();

  labName: string;

  logo = 'assets/logo/constellab-logo.svg';
  spaceName?: string = null;

  constructor(private labEnvManager: LabEnvStore,
              private authenticatedUserService: LabAuthenticatedUserService,
              private systemService: LabSystemService,
              private titleService: Title) {
  }

  ngOnInit(): void {
    this.centralAppUrl = LabEnvironmentHelper.getCentralFrontAppUrl();
    this.authenticatedUserService.loadAuthenticatedUser();
    // init lab name
    this.setLabName('Lab');
    this.getLabInfo();
  }

  get toolbarColorClass(): Observable<string> {
    return this.labEnvManager.getLabEnvironment$().pipe(
      map(env => env === 'prod' ? 'g-card-background' : 'g-accent-background')
    );
  }

  private getLabInfo(): void {
    this.systemService.getSystemInfo().subscribe(
      systemInfo => this.getSystemInfoSuccess(systemInfo)
    );
  }

  private getSystemInfoSuccess(systemInfo: LabSystemInfo): void {
    this.setLabName(systemInfo.labName);
    if (systemInfo.space) {
      this.logo = this.systemService.getSpacePhotoUrl(systemInfo.space.photo);
      this.spaceName = systemInfo.space.name;
    } else {
      console.error('No space found');
    }
  }

  private setLabName(labName: string): void {
    this.labName = labName;
    this.titleService.setTitle(labName);
  }
}
