import {Component, OnInit} from '@angular/core';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

@Component({
  selector: 'ca-signup-page',
  templateUrl: './ca-signup-page.component.html',
  styleUrls: ['./ca-signup-page.component.scss']
})
export class CaSignupPageComponent implements OnInit {

  loginRoute: string = CaRouterService.getLoginRoute();

  constructor() {
  }

  ngOnInit(): void {
  }

}
