import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlMenuDynamicComponent} from './component/fl-menu-dynamic/fl-menu-dynamic.component';
import {FlMenuDynamicPortalComponent} from './component/fl-menu-dynamic-portal/fl-menu-dynamic-portal.component';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatIconModule} from '@angular/material/icon';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';
import {MatDividerModule} from '@angular/material/divider';
import {RouterModule} from '@angular/router';
import {FlMenuDynamicButtonComponent} from './component/fl-menu-dynamic-button/fl-menu-dynamic-button.component';

/**
 * Module to create mat menu dynamically
 */
@NgModule({
  declarations: [
    FlMenuDynamicComponent,
    FlMenuDynamicPortalComponent,
    FlMenuDynamicButtonComponent],
  exports: [
    FlMenuDynamicComponent,
    FlMenuDynamicPortalComponent,
    FlMenuDynamicButtonComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    FlTranslateModule,
    FlIconModule,

    MatMenuModule,
    MatIconModule,
    MatDividerModule,
  ],
})
export class FlMenuDynamicModule {
}
