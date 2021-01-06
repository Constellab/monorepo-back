import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {SnackBarService} from '../../../core/service/snack-bar.service';

@Component({
  selector: 'gen-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private snackBarService: SnackBarService) {
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
