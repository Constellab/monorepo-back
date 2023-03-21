import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FlDialogService, FlPasswordForgottenComponent, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

@Component({
  selector: 'ca-login-page',
  templateUrl: './ca-login-page.component.html',
  styleUrls: ['./ca-login-page.component.scss']
})
export class CaLoginPageComponent implements OnInit {

  appRoute: string = CaRouterService.getAppRoute();

  signupRoute: string = CaRouterService.getSignupRoute();

  constructor(private route: ActivatedRoute,
              private snackBarService: FlSnackBarService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      params => this.checkRouteQueryParams(params)
    );

  }

  // check if there are any query params 'error' or 'success'
  // used for signup, account unlock
  private checkRouteQueryParams(params: Params): void {
    // use a timeout to let the translation load
    setTimeout(() => {
      if (params.error) {
        this.snackBarService.openErrorMessage({text: params.error, translateText: true});
      } else if (params.success) {
        this.snackBarService.openSuccessMessage({text: params.success, translateText: true});
      }
    }, 300);
  }

  openPasswordForgotten(): void {
    this.dialogService.openSmallDialog(FlPasswordForgottenComponent);
  }

}
