import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSettingsPageComponent} from './component/ca-settings-page/ca-settings-page.component';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaSettingsRoutingModule} from './ca-settings-routing.module';
import {CaThemeSelectionComponent} from './component/ca-theme-selection/ca-theme-selection.component';
import {CaLanguageSelectionComponent} from './component/ca-language-selection/ca-language-selection.component';
import {FormsModule} from '@angular/forms';

/**
 * Module for the settings page
 */
@NgModule({
  declarations: [
    CaSettingsPageComponent,
    CaThemeSelectionComponent,
    CaLanguageSelectionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    CaCoreModule,

    CaSettingsRoutingModule,
  ]
})
export class CaSettingsModule {
}
