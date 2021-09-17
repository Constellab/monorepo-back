import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './da-app.component';
import { RouterModule } from '@angular/router';
import { DaCoreModule } from './core/da-core.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: 'enabled' }),
    DaCoreModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
