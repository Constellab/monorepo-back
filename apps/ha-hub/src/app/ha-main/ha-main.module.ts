import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HaMainComponent} from './ha-main.component';
import {HaMainRoutingModule} from './ha-main-routing-module';
import {TranslateModule} from '@ngx-translate/core';
import {HaCoreModule} from '../ha-core/ha-core.module';
import { UserInitiliasIconComponent } from './user-initilias-icon/user-initilias-icon.component';



@NgModule({
  declarations: [HaMainComponent, UserInitiliasIconComponent],
  imports: [
    CommonModule,
    HaMainRoutingModule,
    TranslateModule,
    HaCoreModule
  ]
})
export class HaMainModule { }
