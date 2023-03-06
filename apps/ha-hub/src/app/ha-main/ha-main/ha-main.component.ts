import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {HaUser} from '../../ha-core/ha-model/ha-entities/ha-user';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';
import {FlDialogService} from '@monorepo/front-core-lib';
import {HaAuthService} from '../../ha-core/ha-service/ha-auth.service';
import {HaApiServiceConfig} from '../../ha-core/ha-model/ha-config/ha-api-module.config';
import {HaRouterService} from '../../ha-core/ha-service/ha-router.service';
import {ActivatedRoute, UrlSegment} from '@angular/router';

@Component({
  selector: 'ha-main',
  templateUrl: './ha-main.component.html',
  styleUrls: ['./ha-main.component.scss']
})
export class HaMainComponent implements OnInit {

  userConnected$: Observable<HaUser> = this.authUserService.getUser();

  loginRoute: string = HaRouterService.getLoginRoute();

  currentUrlSegment: UrlSegment[];


  constructor(private authUserService: HaAuthenticatedUserService,
              private authService: HaAuthService,
              private dialogService: FlDialogService,
              private apiService: HaApiServiceConfig,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.url.subscribe(url => {
      this.currentUrlSegment = url;
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  getStoryListRoute(): string {
    return HaRouterService.getStoryListRoute();
  }

  getBrickListRoute(): string {
    return HaRouterService.getBrickListRoute();
  }

  getProductDocRoute(): string {
    return HaRouterService.getProducDocRoute();
  }

  getTechDocRoute(): string {
    return HaRouterService.getTechDocRoute();
  }

}
