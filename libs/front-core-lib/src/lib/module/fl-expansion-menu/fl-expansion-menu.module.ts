import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlExpansionMenuComponent} from './fl-expansion-menu/fl-expansion-menu.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlExpansionMenuButtonDirective} from './fl-expansion-menu-button/fl-expansion-menu-button.directive';
import {
  FlExpansionMenuButtonToggleDirective
} from './fl-expansion-menu-button-toggle/fl-expansion-menu-button-toggle.directive';


@NgModule({
  declarations: [
    FlExpansionMenuComponent,
    FlExpansionMenuButtonDirective,
    FlExpansionMenuButtonToggleDirective
  ],
  exports: [
    FlExpansionMenuComponent,
    FlExpansionMenuButtonDirective,
    FlExpansionMenuButtonToggleDirective
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,

  ],
})
export class FlExpansionMenuModule {
}
