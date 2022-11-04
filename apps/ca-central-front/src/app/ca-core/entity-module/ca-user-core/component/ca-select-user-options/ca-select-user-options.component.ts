import {AfterViewInit, Component, Host, Input, OnDestroy, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {
  FlDatasourcePaginated,
  FlEmbeddedOptionsAbstractDirective,
  FlEntityPaginatedDatasource
} from '@monorepo/front-core-lib';
import {CaOrganizationService} from '../../../../service-api/ca-organization.service';
import {Observable} from 'rxjs';
import {CaUsersService} from '../../../../service-api/ca-users.service';
import {map} from 'rxjs/operators';

export type CaSelectUserMode = 'all' | 'organization';

@Component({
  selector: 'ca-select-user-options',
  templateUrl: './ca-select-user-options.component.html',
  styleUrls: ['./ca-select-user-options.component.scss']
})
export class CaSelectUserOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  @Input() mode: CaSelectUserMode = 'organization';

  datasource: FlDatasourcePaginated<any>;
  users$: Observable<CaUser[]>;


  constructor(private organizationService: CaOrganizationService,
              private userService: CaUsersService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.getUsers();
  }

  private getUsers(): void {
    if (this.mode === 'all') {
      this.datasource = new FlEntityPaginatedDatasource(
        (page, size) => this.userService.findAll(page, size),
        20);
      this.users$ = this.datasource.connect();

    } else {
      this.datasource = this.organizationService.getUsersOfOrganizationDatasource('current');
      this.users$ = this.datasource.connect().pipe(
        map(orgaUsers => orgaUsers.map(orgaUser => orgaUser.user))
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
