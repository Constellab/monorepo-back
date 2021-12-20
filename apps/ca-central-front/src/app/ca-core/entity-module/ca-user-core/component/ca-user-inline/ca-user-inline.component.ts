import {Component, Input, OnInit} from '@angular/core';
import {CaUser} from '../../../../model/entities/ca-user.class';

/**
 * Component to display a user photo with the user name and job on the right of the photo
 */
@Component({
  selector: 'ca-user-inline',
  templateUrl: './ca-user-inline.component.html',
  styleUrls: ['./ca-user-inline.component.scss']
})
export class CaUserInlineComponent implements OnInit {

  @Input() user: CaUser;

  @Input() showName: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }

}
