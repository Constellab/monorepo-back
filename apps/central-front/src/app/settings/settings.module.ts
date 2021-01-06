import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsPageComponent} from './component/settings-page/settings-page.component';
import {CoreModule} from '../core/core.module';
import {SettingsRoutingModule} from './settings-routing.module';
import {ThemeSelectionComponent} from './component/theme-selection/theme-selection.component';

/**
 * Module for the settings page
 */
@NgModule({
  declarations: [SettingsPageComponent, ThemeSelectionComponent],
  imports: [
    CommonModule,

    CoreModule,

    SettingsRoutingModule,
  ]
})
export class SettingsModule {
}
