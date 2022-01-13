import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlContextMenuComponent} from './component/fl-context-menu/fl-context-menu.component';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';
import {MatDividerModule} from '@angular/material/divider';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';


@NgModule({
  declarations: [FlContextMenuComponent],
  exports: [FlContextMenuComponent],
  imports: [
    CommonModule,

    FlPortalModule,
    FlIconModule,
    FlTranslateModule,

    MatDividerModule,
    MatMenuModule,
    MatIconModule
  ],
})
export class FlContextMenuModule {
}
