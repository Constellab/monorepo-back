import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'fl-user-profile-picture',
  templateUrl: './fl-user-profile-picture.component.html',
  styleUrls: ['./fl-user-profile-picture.component.scss']
})
export class FlUserProfilePictureComponent implements OnInit {

  @Input()
  firstName: string;

  @Input()
  lastName: string;

  initials: string;

  constructor() { }

  ngOnInit(): void {
    this.initials = (this.firstName?.charAt(0) ?? '') + (this.lastName?.charAt(0) ?? '');
  }

}
