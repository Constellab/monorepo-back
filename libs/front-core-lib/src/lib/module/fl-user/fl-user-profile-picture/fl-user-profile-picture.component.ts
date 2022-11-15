import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FlUserConfig} from '../service/fl-user-config.config';
import {Subject} from 'rxjs';

export interface FlUserProfilePicture {
  firstname: string;
  lastname: string;
  photo: string;
  id: string;
}

export type FlUserProfilePictureSize = 'small' | 'medium' | 'big';

@Component({
  selector: 'fl-user-profile-picture',
  templateUrl: './fl-user-profile-picture.component.html',
  styleUrls: ['./fl-user-profile-picture.component.scss']
})
export class FlUserProfilePictureComponent implements OnInit, OnDestroy {

  @Input()
  user: FlUserProfilePicture;

  @Input()
  size: FlUserProfilePictureSize | string = 'medium';

  sizeNumber: number = 3.5;

  fontSize: number;

  initials: string;

  hasPhoto$: Subject<boolean> = new Subject<boolean>();

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
        this.sizeNumber = 2.5;
        break;
      case 'medium':
        this.sizeNumber = 3.5;
        break;
      case 'big':
        this.sizeNumber = 5.5;
        break;
      default:
        this.sizeNumber = +this.size;
    }
    this.fontSize = this.sizeNumber / 4;

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
