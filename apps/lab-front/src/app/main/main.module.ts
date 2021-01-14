import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainAppComponent } from './component/main-app/main-app.component';


@NgModule({
  declarations: [MainAppComponent],
  imports: [
    CommonModule,

    // Routing
    MainRoutingModule
  ]
})
export class MainModule { }
