import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './da-app.component';
import { RouterModule } from '@angular/router';
import { DaAdminModule } from './da-admin/da-admin.module';
import { CoreModule } from '@angular/flex-layout';
import { FlApiModule } from '../../../../libs/front-core-lib/src';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: 'enabled' }),
    DaAdminModule,
    
    // Core Modules
    CoreModule,

    FlApiModule.forRoot(ApiServiceConfig, ApiErrorService, 'front-errors'),

  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
