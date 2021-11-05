import {Component, OnInit} from '@angular/core';
import {constLoginRoute} from '../../../core/utils/base-route';
import {FlConfirmDialogInput, FlDialogService} from '@monorepo/front-core-lib';
import {AuthenticationService} from '../../../core/service/authentication.service';
import {Router} from '@angular/router';
import {LabSystemService} from '../../../core/service/lab-system.service';
import {DocumentationBrick, getDocumentationBricks} from '../../utils/documentation-link.class';
import {EnvironmentHelper} from '../../../core/utils/environment.helper';
import {RouterService} from '../../../core/service/router.service';

/**
 * Component for the settings button on top right of the screen
 */
@Component({
  selector: 'gen-main-menu-settings',
  templateUrl: './main-menu-settings.component.html',
  styleUrls: ['./main-menu-settings.component.scss']
})
export class MainMenuSettingsComponent implements OnInit {

  documentationBricks: DocumentationBrick[];

  codeServerUrl: string;

  monitoringRoute = RouterService.getLabMonitoringRoute();

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private dialogService: FlDialogService,
              private systemService: LabSystemService) {
  }

  ngOnInit(): void {
    this.documentationBricks = getDocumentationBricks();
    this.codeServerUrl = EnvironmentHelper.getCodeServerUrl();
  }

  logout(): void {
    this.authenticationService.logout().subscribe(
      () => this.router.navigate([constLoginRoute])
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
