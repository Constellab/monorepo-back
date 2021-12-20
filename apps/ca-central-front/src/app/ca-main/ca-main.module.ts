import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaMainAppComponent} from './component/ca-main-app/ca-main-app.component';
import {CaMainRoutingModule} from './ca-main-routing.module';
import {CaCoreModule} from '../ca-core/ca-core.module';

/**
 * Main modules tha manage the pages once the user is connected
 */
@NgModule({
  declarations: [
    CaMainAppComponent
  ],
  imports: [
    CommonModule,

    // routing
    CaMainRoutingModule,
    CaCoreModule,
  ]
})
export class CaMainModule {
}
