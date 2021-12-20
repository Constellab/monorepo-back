import {Component, OnInit} from '@angular/core';
import {LabRouterService} from '../../../lab-core/service/lab-router.service';

@Component({
  selector: 'lab-login-page',
  templateUrl: './lab-login-page.component.html',
  styleUrls: ['./lab-login-page.component.scss']
})
export class LabLoginPageComponent implements OnInit {
  appRoute: string = LabRouterService.getAppRoute();

  constructor() {
  }

  ngOnInit(): void {
  }
}
