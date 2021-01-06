import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../../../model/entities/user.class';

/**
 * Component to display a user photo with the user name and job on the right of the photo
 */
@Component({
  selector: 'gen-user-inline',
  templateUrl: './user-inline.component.html',
  styleUrls: ['./user-inline.component.scss']
})
export class UserInlineComponent implements OnInit {

  @Input() user: User;

  @Input() showName: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }

}
