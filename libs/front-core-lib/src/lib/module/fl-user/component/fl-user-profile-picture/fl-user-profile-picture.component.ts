import {Component, Input, OnInit} from '@angular/core';
import {FlUserConfig} from '../../service/fl-user-config.config';
import {FlUser} from '../../model/fl-user.class';


export type FlUserProfilePictureSize = 'small' | 'medium' | 'big';

@Component({
  selector: 'fl-user-profile-picture',
  templateUrl: './fl-user-profile-picture.component.html',
  styleUrls: ['./fl-user-profile-picture.component.scss']
})
export class FlUserProfilePictureComponent implements OnInit {

  @Input() border: boolean = false;
  @Input() set user(user: FlUser) {
    this.setUser(user);
  }

  /**
   * Default size of size in em
   */
  @Input() size: FlUserProfilePictureSize | string | number = 'medium';

  circleSize: string;

  fontSize: number;

  initials: string;

  imgSrc?: string;

  constructor(private userConfig: FlUserConfig) {
  }

  ngOnInit(): void {

    switch (this.size) {
      case 'small':
        this.circleSize = '2.5em';
        this.fontSize = 2.5 / 4;
        break;
      case 'medium':
        // same size as the icon button
        this.circleSize = '40px';
        this.fontSize = 0.875;
        break;
      case 'big':
        this.circleSize = '5.5em';
        this.fontSize = 5.5 / 4;
        break;
      default:
        this.circleSize = this.size + 'em';
        this.fontSize = (+this.circleSize) / 4;
    }
  }

  private setUser(user: FlUser): void {
    if (user) {
      this.initials = (user.firstname?.charAt(0) ?? '') + (user.lastname?.charAt(0) ?? '');
      if (user.photo) {
        this.imgSrc = this.userConfig.getUserPhotoUrl(user.id);
      }else{
        this.imgSrc = null;
      }
    } else {
      this.initials = '';
      this.imgSrc = null;
    }
  }
}
