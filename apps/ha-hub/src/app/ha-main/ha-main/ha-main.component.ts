import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {HaUser} from '../../ha-core/ha-model/ha-entities/ha-user';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';
import {HaMainLoginComponent} from '../ha-main-login/ha-main-login.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {HaAuthService} from '../../ha-core/ha-service/ha-auth.service';
import {HaApiServiceConfig} from '../../ha-core/ha-model/ha-config/ha-api-module.config';

@Component({
  selector: 'ha-main',
  templateUrl: './ha-main.component.html',
  styleUrls: ['./ha-main.component.scss']
})
export class HaMainComponent implements OnInit {
  userConnected$: Observable<HaUser> = this.authUserService.getUser();
  constellabUrl: string;
  constructor(
    private authUserService: HaAuthenticatedUserService,
    private authService: HaAuthService,
    private dialogService: FlDialogService,
    private apiService: HaApiServiceConfig
  ) {
  }

  ngOnInit(): void {
    this.constellabUrl = this.apiService.getConstellabUrl();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.authUserService.init();
    });
  }

  openLoginDialog(): void {
    this.dialogService.openSmallDialog(HaMainLoginComponent).afterClosed().subscribe(() => {
    });
  }
}
