import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlDrawerOpenerComponent} from './component/fl-drawer-opener/fl-drawer-opener.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';


@NgModule({
  declarations: [
    FlDrawerOpenerComponent
  ],
  exports: [
    FlDrawerOpenerComponent
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatIconModule,
  ],
})
export class FlDrawerModule {
}
