import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsPageComponent} from './component/settings-page/settings-page.component';
import {CoreModule} from '../core/core.module';
import {SettingsRoutingModule} from './settings-routing.module';
import {ThemeSelectionComponent} from './component/theme-selection/theme-selection.component';
import {LanguageSelectionComponent} from './component/language-selection/language-selection.component';
import {FormsModule} from '@angular/forms';

/**
 * Module for the settings page
 */
@NgModule({
  declarations: [
    SettingsPageComponent,
    ThemeSelectionComponent,
    LanguageSelectionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    CoreModule,

    SettingsRoutingModule,
  ]
})
export class SettingsModule {
}
