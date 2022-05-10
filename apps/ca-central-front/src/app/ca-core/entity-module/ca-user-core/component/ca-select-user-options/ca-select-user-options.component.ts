import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {CaUsersService} from '../../../../service-api/ca-users.service';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-select-user-options',
  templateUrl: './ca-select-user-options.component.html',
  styleUrls: ['./ca-select-user-options.component.scss']
})
export class CaSelectUserOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  users: CaUser[];

  isLoading: boolean = false;

  constructor(private userService: CaUsersService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.getUsers();
  }

  private getUsers(): void {
    this.isLoading = true;
    this.userService.findAll().subscribe({
      next: users => this.getSuccess(users),
      error: () => this.isLoading = false
    });
  }

  private getSuccess(users: CaUser[]): void {
    this.isLoading = false;
    this.users = users;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
