import {NgModule} from '@angular/core';
import { FlEmojiPickerPortalComponent } from './component/fl-emoji-picker-portal/fl-emoji-picker-portal.component';
import {PickerModule} from '@ctrl/ngx-emoji-mart';

@NgModule({
  imports: [
    PickerModule
  ],
  exports: [
    FlEmojiPickerPortalComponent
  ],
  declarations: [
    FlEmojiPickerPortalComponent
  ]
})
export class FlEmojiPickerModule{

}
