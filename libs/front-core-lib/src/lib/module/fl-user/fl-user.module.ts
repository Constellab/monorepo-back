import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlUserProfilePictureComponent} from './fl-user-profile-picture/fl-user-profile-picture.component';


@NgModule({
  declarations: [
    FlUserProfilePictureComponent
  ],
  exports: [
    FlUserProfilePictureComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FlUserModule { }
