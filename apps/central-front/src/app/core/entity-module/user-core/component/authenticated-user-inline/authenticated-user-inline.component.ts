import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../../../model/entities/user.class';
import {AuthenticatedUserService} from '../../../../service-api/authenticated-user.service';

/**
 * Component to display the current user photo, name and job
 */
@Component({
  selector: 'gen-authenticated-user-inline',
  templateUrl: './authenticated-user-inline.component.html',
  styleUrls: ['./authenticated-user-inline.component.scss']
})
export class AuthenticatedUserInlineComponent implements OnInit {

  @Input() showName: boolean = true;

  authenticatedUser: User;

  constructor(private authenticatedUserService: AuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.authenticatedUser = this.authenticatedUserService.getUser();
  }

}
