import {AfterViewInit, Component, Host, Input, OnDestroy, OnInit} from '@angular/core';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {
  FlDatasourcePaginated,
  FlEmbeddedOptionsAbstractDirective,
  FlEntityPaginatedDatasource
} from '@monorepo/front-core-lib';
import {CaSpaceService} from '../../../../service-api/ca-space.service';
import {Observable} from 'rxjs';
import {CaUsersService} from '../../../../service-api/ca-users.service';
import {map} from 'rxjs/operators';
import {CaAuthenticatedUserService} from '../../../../service-api/ca-authenticated-user.service';

/**
 * AllForAdmin --> show all user only for G admin user otherwise space
 */
export type CaSelectUserMode = 'all' | 'space' | 'allForAdmin';

@Component({
  selector: 'ca-select-user-options',
  templateUrl: './ca-select-user-options.component.html',
  styleUrls: ['./ca-select-user-options.component.scss']
})
export class CaSelectUserOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  @Input() mode: CaSelectUserMode = 'space';

  datasource: FlDatasourcePaginated<any>;
  users$: Observable<CaUser[]>;


  constructor(private spaceService: CaSpaceService,
              private userService: CaUsersService,
              private authenticatedUserService: CaAuthenticatedUserService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.getUsers();
  }

  private getUsers(): void {
    if (this.mode === 'all' || (this.mode === 'allForAdmin' && this.authenticatedUserService.isAdmin())) {
      this.datasource = new FlEntityPaginatedDatasource(
        (page, size) => this.userService.findAll(page, size),
        20);
      this.users$ = this.datasource.connect();

    } else {
      this.datasource = this.spaceService.getUsersOfSpaceDatasource('current');
      this.users$ = this.datasource.connect().pipe(
        map(spaceUsers => spaceUsers.map(spaceUser => spaceUser.user))
      );
    }
  }


  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource?.disconnect();
  }


}
