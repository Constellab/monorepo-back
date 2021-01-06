import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {EmbeddedOptionsAbstractDirective} from '../../../../abstract-directive/embedded-options-abstract.directive';
import {MatSelect} from '@angular/material/select';
import {User} from '../../../../model/entities/user.class';
import {UsersService} from '../../../../service-api/users.service';

@Component({
  selector: 'gen-select-user-options',
  templateUrl: './select-user-options.component.html',
  styleUrls: ['./select-user-options.component.scss']
})
export class SelectUserOptionsComponent extends EmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  users: User[];

  isLoading: boolean = false;

  constructor(private userService: UsersService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.getUsers();
  }

  private getUsers(): void {
    this.isLoading = true;
    this.userService.findAll().subscribe(
      users => this.getSuccess(users),
      () => this.isLoading = false
    );
  }

  private getSuccess(users: User[]): void {
    this.isLoading = false;
    this.users = users;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
