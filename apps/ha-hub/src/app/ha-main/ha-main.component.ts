import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {HaUser} from '../ha-core/ha-model/ha-entities/ha-user';
import {HaAuthenticatedUserService} from '../ha-core/ha-service/ha-authenticated-user.service';
import {HaMainLoginComponent} from './ha-main-login/ha-main-login.component';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ha-main',
  templateUrl: './ha-main.component.html',
  styleUrls: ['./ha-main.component.scss']
})
export class HaMainComponent implements OnInit {
  userConnected: Observable<HaUser> = this.authUserService.getUser();

  constructor(
    private authUserService: HaAuthenticatedUserService,
    private dialogService: FlDialogService,
  ) { }

  ngOnInit(): void {
  }

  openLoginDialog(): void {
    this.dialogService.openSmallDialog(HaMainLoginComponent).afterClosed().subscribe(() => {
    });
  }
}
