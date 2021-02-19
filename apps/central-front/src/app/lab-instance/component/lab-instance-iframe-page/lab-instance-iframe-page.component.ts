import {Component, OnInit} from '@angular/core';
import {LabInstanceToken} from '../../../core/model/entities/lab-instance.class';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';
import {ActivatedRoute, Params} from '@angular/router';
import {combineLatest} from 'rxjs';
import {LabIframeOptions} from '../../../core/service/router.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Page for the lab instance iframe
 */
@Component({
  selector: 'gen-lab-instance-iframe-page',
  templateUrl: './lab-instance-iframe-page.component.html',
  styleUrls: ['./lab-instance-iframe-page.component.scss']
})
export class LabInstanceIframePageComponent implements OnInit {

  labInstanceToken: LabInstanceToken;

  iframeOptions: LabIframeOptions;

  errorText: string = 'object_not_found';

  isLoading: boolean = false;

  constructor(private labInstanceService: LabInstanceService,
              private route: ActivatedRoute,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(
      (result: [Params, Params]) => this.init(result[0].id, result[1])
    );
  }

  private init(id: string, queryParams: Params): void {
    // this.logUserToLab(id);

    if (queryParams && queryParams.objectType && queryParams.objectId) {
      this.iframeOptions = queryParams as LabIframeOptions;
    }
  }

  private logUserToLab(id: string): void {
    this.isLoading = true;
    this.labInstanceService.logUserToLab(id).subscribe(
      labInstance => this.loginSuccess(labInstance),
      () => this.isLoading = false
    );
  }

  private loginSuccess(labInstanceToken: LabInstanceToken): void {
    this.isLoading = false;

    if (!labInstanceToken.labInstance.isRunning()) {
      this.snackBarService.openErrorMessage('lab_not_running', true);
      this.errorText = 'lab_not_running';
      return;
    }
    this.labInstanceToken = labInstanceToken;
  }

}
