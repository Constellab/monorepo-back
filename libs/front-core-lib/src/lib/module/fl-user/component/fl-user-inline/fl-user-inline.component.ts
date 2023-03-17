import {Component, Input, OnInit} from '@angular/core';
import {FlUser} from '../../model/fl-user.class';
import {FlUserProfilePictureSize} from '../fl-user-profile-picture/fl-user-profile-picture.component';

@Component({
  selector: 'fl-user-inline',
  templateUrl: './fl-user-inline.component.html',
  styleUrls: ['./fl-user-inline.component.scss']
})
export class FlUserInlineComponent implements OnInit {

  @Input() user: FlUser;

  @Input() showName: boolean = true;

  @Input() showPopUp: boolean = true;

  @Input() customTextSize: boolean = false;

  /**
   * Default size of size in em
   */
  @Input() profilePictureSize: FlUserProfilePictureSize = 'small';

  constructor() { }

  ngOnInit(): void {
  }

}
