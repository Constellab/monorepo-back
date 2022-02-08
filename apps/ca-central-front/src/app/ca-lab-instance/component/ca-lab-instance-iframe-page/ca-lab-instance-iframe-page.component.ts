import {Component, OnInit} from '@angular/core';
import {CaLabInstanceToken} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {ActivatedRoute, Params} from '@angular/router';
import {combineLatest} from 'rxjs';
import {CaLabIframeOptions} from '../../../ca-core/service/ca-router.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {CaLabIframeService} from '../../../ca-core/service-api/ca-lab-iframe.service';

/**
 * Page for the lab instance iframe
 */
@Component({
  selector: 'ca-lab-instance-iframe-page',
  templateUrl: './ca-lab-instance-iframe-page.component.html',
  styleUrls: ['./ca-lab-instance-iframe-page.component.scss']
})
export class CaLabInstanceIframePageComponent implements OnInit {

  labInstanceToken: CaLabInstanceToken;

  iframeOptions: CaLabIframeOptions;

  errorText: string = 'object_not_found';

  isLoading: boolean = false;

  constructor(private labInstanceService: CaLabInstanceService,
              private route: ActivatedRoute,
              private snackBarService: FlSnackBarService,
              private labIframeService: CaLabIframeService) {
  }

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(
      (result: [Params, Params]) => this.init(result[0].id, result[1])
    );
  }

  private init(id: string, queryParams: Params): void {
    this.logUserToLab(id);

    if (queryParams && queryParams.objectType && queryParams.objectId) {
      this.iframeOptions = queryParams as CaLabIframeOptions;
    }
  }

  private logUserToLab(id: string): void {
    this.isLoading = true;
    this.labInstanceService.logUserToLab(id).subscribe(
      labInstance => this.loginSuccess(labInstance),
      () => this.isLoading = false
    );
  }

  private loginSuccess(labInstanceToken: CaLabInstanceToken): void {
    this.isLoading = false;

    // redirect to lab front
    window.location.replace(this.labIframeService.getLoginUrl(labInstanceToken.labInstance.frontUrl, labInstanceToken.token));

    // if (!labInstanceToken.labInstance.isRunning()) {
    //   this.snackBarService.openErrorMessage('lab_not_running', true);
    //   this.errorText = 'lab_not_running';
    //   return;
    // }
    // this.labInstanceToken = labInstanceToken;
  }

}
