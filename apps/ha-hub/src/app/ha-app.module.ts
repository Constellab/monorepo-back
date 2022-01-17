import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppComponent} from './ha-app.component';
import {
  FlApiModule,
  FlTranslateModule,
  FlSnackBarModule,
  FlDialogModule,
  FlAuthModule,
  FlHttpInterceptorService, FlPortalModule
} from '@monorepo/front-core-lib';
import {DaApiServiceConfig} from './ha-core/ha-model/ha-config/ha-api-module.config';
import {HaApiErrorService} from './ha-core/ha-model/ha-config/ha-api-error.service';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { HaAppRoutingModule } from './ha-app-routing-module';
import { HaCoreModule } from './ha-core/ha-core.module';
import {HaAuthService} from './ha-core/ha-service/ha-auth.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    HaAppRoutingModule,
    HaCoreModule,

    FlApiModule.forRoot(DaApiServiceConfig, HaApiErrorService),

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

  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: FlHttpInterceptorService,
    multi: true
  },],
  bootstrap: [AppComponent],
})
export class AppModule {}
