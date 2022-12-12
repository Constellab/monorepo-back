import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FlUserConfig} from '../../service/fl-user-config.config';
import {Subject} from 'rxjs';
import {FlUser} from '../../model/fl-user.class';


export type FlUserProfilePictureSize = 'small' | 'medium' | 'big';

@Component({
  selector: 'fl-user-profile-picture',
  templateUrl: './fl-user-profile-picture.component.html',
  styleUrls: ['./fl-user-profile-picture.component.scss']
})
export class FlUserProfilePictureComponent implements OnInit, OnDestroy {

  @Input() user: FlUser;

  /**
   * Default size of size in em
   */
  @Input() size: FlUserProfilePictureSize | string | number = 'medium';

  @Input() hasPhoto$: Subject<boolean> = new Subject<boolean>();

  circleSize: string;

  fontSize: number;

  initials: string;

  imgSrc: string;

  constructor(private userConfig: FlUserConfig) {
  }

  ngOnInit(): void {
    if (this.user) {
      this.initials = (this.user.firstname?.charAt(0) ?? '') + (this.user.lastname?.charAt(0) ?? '');
      if (this.user.photo) {
        this.getPhotoLink();
      }
    }
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

  getPhotoLink(): string {
    const link: string = this.userConfig.getUserPhotoUrl(this.user.id);
    this.checkIfImage(link);
    return link;
  }

  private checkIfImage(link: string): void {
    const img: HTMLImageElement = new Image();
    img.src = link;
    img.onload = () => {
      this.imgSrc = link;
      this.hasPhoto$.next(true);
    };

    img.onerror = () => {
      this.hasPhoto$.next(false);
    };
  }

  ngOnDestroy(): void {
    this.hasPhoto$.complete();
  }
}
