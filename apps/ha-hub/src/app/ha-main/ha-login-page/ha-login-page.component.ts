import {Component, OnInit} from '@angular/core';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';
import {Location} from '@angular/common';
import {environment} from '../../../environments/ha-environment';

@Component({
  selector: 'ha-login-page',
  templateUrl: './ha-login-page.component.html',
  styleUrls: ['./ha-login-page.component.scss']
})
export class HaLoginPageComponent implements OnInit {

  spaceSignupRoute: string = environment.constellabUrl + 'signup';


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
