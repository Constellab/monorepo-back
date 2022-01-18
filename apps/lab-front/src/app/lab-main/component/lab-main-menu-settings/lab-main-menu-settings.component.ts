import {Component, OnInit} from '@angular/core';
import {labConstLoginRoute} from '../../../lab-core/utils/lab-base-route';
import {FlConfirmDialogInput, FlDialogService} from '@monorepo/front-core-lib';
import {LabAuthenticationService} from '../../../lab-core/service/lab-authentication.service';
import {Router} from '@angular/router';
import {LabSystemService} from '../../../lab-core/service/lab-system.service';
import {LabEnvironmentHelper} from '../../../lab-core/utils/lab-environment.helper';
import {LabRouterService} from '../../../lab-core/service/lab-router.service';

/**
 * Component for the settings button on top right of the screen
 */
@Component({
  selector: 'lab-main-menu-settings',
  templateUrl: './lab-main-menu-settings.component.html',
  styleUrls: ['./lab-main-menu-settings.component.scss']
})
export class LabMainMenuSettingsComponent implements OnInit {


  codeServerUrl: string;

  monitoringRoute = LabRouterService.getMonitoringRoute();

  constructor(private authenticationService: LabAuthenticationService,
              private router: Router,
              private dialogService: FlDialogService,
              private systemService: LabSystemService) {
  }

  ngOnInit(): void {
    this.codeServerUrl = LabEnvironmentHelper.getCodelabFullUrl();
  }

  logout(): void {
    this.authenticationService.logout().subscribe(
      () => this.router.navigate([labConstLoginRoute])
    );
  }

  resetDevEnvironment(): void {
    const data: FlConfirmDialogInput = {
      title: 'reset_dev_env',
      content: 'reset_dev_env_confirmation',
      translateTitleAndContent: true,
      observable: this.systemService.resetDevEnvironment(),
      successMessage: 'dev_env_reset_success',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data);
  }

  stopDevServer(): void {
    const data: FlConfirmDialogInput = {
      title: 'stop_dev_api',
      content: 'stop_dev_api_confirmation',
      translateTitleAndContent: true,
      observable: this.systemService.killApi(),
      successMessage: 'dev_api_stooped',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data);
  }

}
