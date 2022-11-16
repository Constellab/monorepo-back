import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaUserSettingsDialogComponent} from './component/ca-user-settings-dialog/ca-user-settings-dialog.component';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaSettingsRoutingModule} from './ca-settings-routing.module';
import {CaThemeSelectionComponent} from './component/ca-theme-selection/ca-theme-selection.component';
import {CaLanguageSelectionComponent} from './component/ca-language-selection/ca-language-selection.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaUserProfileSectionComponent} from './component/ca-user-profile-section/ca-user-profile-section.component';
import {
  CaUserProfileEditDialogComponent
} from './component/ca-user-profile-edit-dialog/ca-user-profile-edit-dialog.component';
import {CaUserTwoFaToggleComponent} from './component/ca-user-two-fa-toggle/ca-user-two-fa-toggle.component';

/**
 * Module for the settings page
 */
@NgModule({
  declarations: [
    CaUserSettingsDialogComponent,
    CaThemeSelectionComponent,
    CaLanguageSelectionComponent,
    CaUserProfileSectionComponent,
    CaUserProfileEditDialogComponent,
    CaUserTwoFaToggleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    CaCoreModule,

    CaSettingsRoutingModule,
    ReactiveFormsModule,
  ]
})
export class CaSettingsModule {
}
