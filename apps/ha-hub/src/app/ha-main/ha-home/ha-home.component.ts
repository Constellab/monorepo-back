import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {HaUser} from '../../ha-core/ha-model/ha-entities/ha-user';
import {HaRouterService} from '../../ha-core/ha-service/ha-router.service';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';
import {HaAuthService} from '../../ha-core/ha-service/ha-auth.service';
import {HaApiServiceConfig} from '../../ha-core/ha-model/ha-config/ha-api-module.config';

@Component({
  selector: 'ha-ha-home',
  templateUrl: './ha-home.component.html',
  styleUrls: ['./ha-home.component.scss']
})
export class HaHomeComponent implements OnInit {

  userConnected$: Observable<HaUser> = this.authUserService.getUser();

  loginRoute: string = HaRouterService.getLoginRoute();

  constellabUrl: string;

  constructor(private authUserService: HaAuthenticatedUserService,
              private authService: HaAuthService,
              private apiService: HaApiServiceConfig) {
  }

  ngOnInit(): void {
    this.constellabUrl = this.apiService.getConstellabUrl();
  }


  getConstellabUrl(): string {
    return this.apiService.getConstellabUrl();
  }
}
