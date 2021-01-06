import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainAppComponent} from './component/main-app/main-app.component';
import {MainRoutingModule} from './main-routing.module';
import {CoreModule} from '../core/core.module';

/**
 * Main modules tha manage the pages once the user is connected
 */
@NgModule({
  declarations: [
    MainAppComponent
  ],
  imports: [
    CommonModule,

    // routing
    MainRoutingModule,
    CoreModule,
  ]
})
export class MainModule {
}
