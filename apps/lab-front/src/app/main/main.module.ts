import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainAppComponent } from './component/main-app/main-app.component';
import {CoreModule} from '../core/core.module';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [MainAppComponent],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,

    // Routing
    MainRoutingModule
  ]
})
export class MainModule { }
