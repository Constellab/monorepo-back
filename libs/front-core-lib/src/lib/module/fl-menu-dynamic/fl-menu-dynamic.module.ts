import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlMenuDynamicComponent} from './component/fl-menu-dynamic/fl-menu-dynamic.component';
import {FlMenuDynamicPortalComponent} from './component/fl-menu-dynamic-portal/fl-menu-dynamic-portal.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';

/**
 * Module to create mat menu dynamically
 */
@NgModule({
  declarations: [
    FlMenuDynamicComponent,
    FlMenuDynamicPortalComponent],
  exports: [
    FlMenuDynamicComponent,
    FlMenuDynamicPortalComponent
  ],
  imports: [
    CommonModule,

    FlTranslateModule,
    FlIconModule,

    MatMenuModule,
    MatIconModule,
  ],
})
export class FlMenuDynamicModule {
}
