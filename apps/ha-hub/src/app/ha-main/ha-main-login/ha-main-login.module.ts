import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HaMainLoginComponent} from './ha-main-login.component';
import {HaCoreModule} from '../../ha-core/ha-core.module';



@NgModule({
  declarations: [HaMainLoginComponent],
  imports: [
    CommonModule,
    HaCoreModule
  ]
})
export class HaMainLoginModule {


}
