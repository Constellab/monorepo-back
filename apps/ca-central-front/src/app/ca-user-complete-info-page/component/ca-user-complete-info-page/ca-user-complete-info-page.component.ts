import {Component, OnInit} from '@angular/core';
import {CaUser} from '../../../ca-core/model/entities/ca-user.class';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {ActivatedRoute} from '@angular/router';
import {CaUsersService} from '../../../ca-core/service-api/ca-users.service';
import {Observable} from 'rxjs';
import {FlDialogService} from '@monorepo/front-core-lib';
import {CaSettingsPageComponent} from '../../../ca-settings/component/ca-settings-page/ca-settings-page.component';

/**
 * Component that show a form on first user login to complete his information
 */
@Component({
  selector: 'ca-user-complete-info-page',
  templateUrl: './ca-user-complete-info-page.component.html',
  styleUrls: ['./ca-user-complete-info-page.component.scss']
})
export class CaUserCompleteInfoPageComponent implements OnInit {

  user$: Observable<CaUser>;
  currentUser: CaUser;
  id: string;


  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private route: ActivatedRoute,
              private userService: CaUsersService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {

    this.currentUser = this.authenticatedUserService.getUser();
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.getUser();

    })
  }

  openSettings(): void{
    this.dialogService.openSmallDialog(CaSettingsPageComponent).afterClosed().subscribe(() => {
      this.getUser();
    });
  }

  getUser(): void{
    this.user$ = this.userService.getById(this.id);
  }
}
