import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {
  FlApiModule,
  FlAuthModule,
  FlDialogModule,
  FlHttpInterceptorService,
  FlIconModule,
  flIconsDefault,
  FlPortalModule,
  FlSnackBarModule,
  FlTextEditorModule,
  FlTranslateModule,
  FlUserModule
} from '@monorepo/front-core-lib';
import {HaApiServiceConfig} from './ha-core/ha-model/ha-config/ha-api-module.config';
import {HaApiErrorService} from './ha-core/ha-model/ha-config/ha-api-error.service';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing-module';
import {HaCoreModule} from './ha-core/ha-core.module';
import {HaAuthService} from './ha-core/ha-service/ha-auth.service';
import {HaAuthenticatedUserService} from './ha-core/ha-service/ha-authenticated-user.service';
import {TdTechnicalDocModule} from '@monorepo/technical-doc';
import {HaTdServiceConfig} from './ha-core/ha-model/ha-config/ha-td-service.config';
import {HaUserConfig} from './ha-core/ha-model/ha-config/ha-user-config.config';

function loadUserOnInit(authenticatedUserService: HaAuthenticatedUserService): () => void {
  return (): void => authenticatedUserService.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    AppRoutingModule,
    HaCoreModule,

    FlUserModule.forRoot(HaUserConfig),

    FlApiModule.forRoot(HaApiServiceConfig, HaApiErrorService),

    TdTechnicalDocModule.forRoot(HaTdServiceConfig),

    FlAuthModule.forRoot(HaAuthService),

    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en],
      filenames: ['global-']
    }),
    FlTranslateModule.forRoot2(),

    FlSnackBarModule.forRoot(),

    FlDialogModule.forRoot(),

    FlPortalModule.forRoot(),

    FlIconModule.forRoot({
      iconFolder: 'assets/fl-mat-icons/',
      iconsToRegister: flIconsDefault
    }),
    FlTextEditorModule.forRoot({
      blots: []
    }),
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: FlHttpInterceptorService,
    multi: true
  },
  {provide: APP_INITIALIZER, useFactory: loadUserOnInit, deps: [HaAuthenticatedUserService], multi: true},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
