import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaNotificationsPortalComponent} from './ca-notifications-portal/ca-notifications-portal.component';
import {CaCustomLibraryModule} from '../ca-core/custom-library/ca-custom-library.module';
import {FlexModule} from '@angular/flex-layout';
import {CaCustomMaterialModule} from '../ca-core/custom-material/ca-custom-material.module';
import {RouterModule} from "@angular/router";


@NgModule({
  declarations: [CaNotificationsPortalComponent],
  imports: [
    CommonModule,
    CaCustomLibraryModule,
    CaCustomMaterialModule,
    FlexModule,
    RouterModule
  ],
  exports: [CaNotificationsPortalComponent]
})
export class CaNotificationsModule { }
