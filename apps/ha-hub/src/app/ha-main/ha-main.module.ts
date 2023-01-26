import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HaMainComponent} from './ha-main/ha-main.component';
import {HaMainRoutingModule} from './ha-main-routing-module';
import {TranslateModule} from '@ngx-translate/core';
import {HaCoreModule} from '../ha-core/ha-core.module';
import {HaLoginPageComponent} from './ha-login-page/ha-login-page.component';
import { HaHomeComponent } from './ha-home/ha-home.component';


@NgModule({
  declarations: [HaMainComponent, HaLoginPageComponent, HaHomeComponent],
  imports: [
    CommonModule,
    HaMainRoutingModule,
    TranslateModule,
    HaCoreModule
  ]
})
export class HaMainModule {
}
