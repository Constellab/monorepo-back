import {Component, OnInit} from '@angular/core';
import {RouterService} from '../../../core/service/router.service';

@Component({
  selector: 'gen-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  appRoute: string = RouterService.getAppRoute();

  constructor() {
  }

  ngOnInit(): void {
  }
}
