import {ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlLoginComponent} from './component/fl-login/fl-login.component';
import {FlAuthService} from './service/fl-auth.service';
import {FlUserAccountService} from './service/fl-user-account.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlDialogModule} from '../fl-dialog/fl-dialog.module';
import {FlSnackBarModule} from '../fl-snack-bar/fl-snack-bar.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {flAuthI18n} from './i18n/fl-auth.i18n';
import {FlPasswordForgottenComponent} from './component/fl-password-forgotten/fl-password-forgotten.component';
import {FlResetPasswordPageComponent} from './component/fl-reset-password-page/fl-reset-password-page.component';
import {FlSignupDialogComponent} from './component/fl-signup-dialog/fl-signup-dialog.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlCardModule} from '../fl-card/fl-card.module';
import {RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {FlSignupFormComponent} from './component/fl-signup-form/fl-signup-form.component';
import {FlCompleteLoginComponent} from './component/fl-complete-login/fl-complete-login.component';
import {FlLoginTwoFAComponent} from './component/fl-login-two-f-a/fl-login-two-f-a.component';
import {FlLoginPageComponent} from './component/fl-login-page/fl-login-page.component';

/**
 * Module containing component for authentication, sign up, password reset
 */
@NgModule({
  declarations: [
    FlLoginComponent,
    FlPasswordForgottenComponent,
    FlResetPasswordPageComponent,
    FlSignupDialogComponent,
    FlSignupFormComponent,
    FlCompleteLoginComponent,
    FlLoginTwoFAComponent,
    FlLoginPageComponent,
  ],
  exports: [
    FlPasswordForgottenComponent,
    FlResetPasswordPageComponent,
    FlSignupDialogComponent,
    FlSignupFormComponent,
    FlCompleteLoginComponent,
    FlLoginPageComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FlexLayoutModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,

    FlCoreComponentModule,
    FlCorePipeModule,
    FlCoreDirectiveModule,
    FlDialogModule,
    FlSnackBarModule,
    FlTranslateModule,
    FlLoaderModule,
    FlCardModule,
  ],
})
export class FlAuthModule {

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlAuthModule', flAuthI18n);
  }

  /**
   * Configure the auth module
   * @param authService provide a service with login and logout routes
   * @param userAccountService (optional) provide a service for signup and user password routes
   *                            (if not provided, the footer of the FlLoginComponent must be disabled)
   */
  public static forRoot(authService: Type<FlAuthService>,
                        userAccountService?: Type<FlUserAccountService>): ModuleWithProviders<FlAuthModule> {
    const providers: Provider[] = [{provide: FlAuthService, useExisting: authService}];

    if (userAccountService) {
      providers.push({provide: FlUserAccountService, useExisting: userAccountService});
    }

    return {
      ngModule: FlAuthModule,
      providers: providers
    };
  }
}
