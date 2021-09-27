import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './da-app.component';
import {RouterModule} from '@angular/router';
import {DaAdminModule} from './da-admin/da-admin.module';
import {CoreModule} from '@angular/flex-layout';
import {FlApiModule, FlTranslateModule, FlSnackBarModule, FlDialogModule} from '@monorepo/front-core-lib';
import {DaApiServiceConfig} from './da-core/da-model/da-config/da-api-module.config';
import {DaApiErrorService} from './da-core/da-model/da-config/da-api-error.service';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: 'enabled' }),
    HttpClientModule,

    DaAdminModule,

    // Core Modules
    CoreModule,

    FlApiModule.forRoot(DaApiServiceConfig, DaApiErrorService),

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
