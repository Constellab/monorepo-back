import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppComponent} from './da-app.component';
import {FlApiModule, FlTranslateModule, FlSnackBarModule, FlDialogModule, FlAuthModule} from '@monorepo/front-core-lib';
import {DaApiServiceConfig} from './da-core/da-model/da-config/da-api-module.config';
import {DaApiErrorService} from './da-core/da-model/da-config/da-api-error.service';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import { HttpClientModule } from '@angular/common/http';
import { DaAppRoutingModule } from './da-app-routing-module';
import { DaCoreModule } from './da-core/da-core.module';
import {DaAuthService} from './da-core/da-service/da-auth.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    DaAppRoutingModule,
    DaCoreModule,

    FlApiModule.forRoot(DaApiServiceConfig, DaApiErrorService),

    FlAuthModule.forRoot(DaAuthService),

    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en],
      filenames: ['global-']
    }),
    FlTranslateModule.forRoot2(),

    FlSnackBarModule.forRoot(),

    FlDialogModule.forRoot(),

  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
