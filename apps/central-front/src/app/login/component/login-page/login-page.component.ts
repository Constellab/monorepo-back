import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {RouterService} from '../../../core/service/router.service';

@Component({
  selector: 'gen-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  appRoute: string = RouterService.getAppRoute();

  constructor(private route: ActivatedRoute,
              private snackBarService: FlSnackBarService) {
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
        this.snackBarService.openErrorMessage(params.error, true);
      } else if (params.success) {
        this.snackBarService.openSuccessMessage(params.success, true);
      }
    }, 300);
  }

}
