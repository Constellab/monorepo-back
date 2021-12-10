import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlDrawerOpenerComponent} from './component/fl-drawer-opener/fl-drawer-opener.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {FlDrawerCloseDirective} from './directive/fl-drawer-close/fl-drawer-close.directive';
import {FlDrawerOverDirective} from './directive/fl-drawer-over/fl-drawer-over.directive';


@NgModule({
  declarations: [
    FlDrawerOpenerComponent,

    FlDrawerCloseDirective,
    FlDrawerOverDirective,
  ],
  exports: [
    FlDrawerOpenerComponent,

    FlDrawerCloseDirective,
    FlDrawerOverDirective,
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatIconModule,
  ],
})
export class FlDrawerModule {
}
