import {Component, OnInit} from '@angular/core';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute, Params} from '@angular/router';
import {HaBrick} from '../../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {Observable} from 'rxjs';
import {HaAuthService} from '../../../../../ha-core/ha-service/ha-auth.service';
import {FlDialogService} from '@monorepo/front-core-lib';
import {HaPublicLoginComponent} from '../../ha-public-login/ha-public-login/ha-public-login.component';
import {HaAuthenticatedUserService} from '../../../../../ha-core/ha-service/ha-authenticated-user.service';
import {HaUser} from '../../../../../ha-core/ha-model/ha-entities/ha-user';

@Component({
  selector: 'ha-public-list-bricks-page',
  templateUrl: './ha-public-brick-page.component.html',
  styleUrls: ['./ha-public-brick-page.component.scss']
})
export class HaPublicBrickPageComponent implements OnInit {

  brick$: Observable<HaBrick>;
  isConnected: Observable<HaUser> = this.authUserService.getUser();

  constructor(
    private daBrickService: HaBrickService,
    private activatedRoute: ActivatedRoute,
    private dialogService: FlDialogService,
    private authService: HaAuthService,
    private authUserService: HaAuthenticatedUserService
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.brick$ = this.daBrickService.getByName(params.brickName);
    });
  }

  openLoginDialog(): void {
    this.dialogService.openMediumDialog(HaPublicLoginComponent).afterClosed().subscribe(() => {
    });
  }
}

