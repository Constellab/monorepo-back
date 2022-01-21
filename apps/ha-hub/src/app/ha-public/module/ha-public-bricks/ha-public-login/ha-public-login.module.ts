import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HaPublicLoginComponent} from './ha-public-login/ha-public-login.component';
import {HaCoreModule} from '../../../../ha-core/ha-core.module';



@NgModule({
  declarations: [HaPublicLoginComponent],
  imports: [
    CommonModule,
    HaCoreModule
  ]
})
export class HaPublicLoginModule {


}
