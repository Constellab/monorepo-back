import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './da-app.component';
import { RouterModule } from '@angular/router';
import { DaCoreModule } from './da-core/da-core.module';
import { DaAdminModule } from './da-admin/da-admin.module';
import { DaAppRoutingModule } from './da-app-routing-module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: 'enabled' }),
    DaCoreModule,
    DaAdminModule,
    DaAppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
