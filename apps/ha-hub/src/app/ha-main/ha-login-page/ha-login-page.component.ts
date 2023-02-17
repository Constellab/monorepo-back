import {Component, OnInit} from '@angular/core';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';
import {Location} from '@angular/common';

@Component({
  selector: 'ha-login-page',
  templateUrl: './ha-login-page.component.html',
  styleUrls: ['./ha-login-page.component.scss']
})
export class HaLoginPageComponent implements OnInit {
  previousUrl: string;

  constructor(private location: Location,
              private authenticatedUserService: HaAuthenticatedUserService) {
  }

  ngOnInit(): void {
  }

  onLoginSuccess(): void {
    this.authenticatedUserService.init();
    this.location.back();
  }

}
