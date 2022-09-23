import {Component, Input, OnInit} from '@angular/core';
import {FlUserConfig} from '../service/fl-user-config.config';

export interface FlUserProfilePicture{
  firstname: string;
  lastname: string;
  photo: string;
  id: string;
}


@Component({
  selector: 'fl-user-profile-picture',
  templateUrl: './fl-user-profile-picture.component.html',
  styleUrls: ['./fl-user-profile-picture.component.scss']
})
export class FlUserProfilePictureComponent implements OnInit {

  @Input()
  user: FlUserProfilePicture;

  @Input()
  size: number = 3;

  fontSize: number;

  initials: string;

  constructor(private userConfig: FlUserConfig) { }

  ngOnInit(): void {
    this.initials = (this.user.firstname?.charAt(0) ?? '') + (this.user.lastname?.charAt(0) ?? '');
    this.fontSize = this.size/4;
  }

  getPhotoLink(): string{
    return this.userConfig.getUserPhoto(this.user.id);
  }

}
