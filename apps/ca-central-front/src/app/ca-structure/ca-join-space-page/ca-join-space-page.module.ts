import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaJoinSpacePageComponent} from './ca-join-space-page/ca-join-space-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSpaceCoreModule} from '../../ca-core/entity-module/ca-space-core/ca-space-core.module';


@NgModule({
  declarations: [
    CaJoinSpacePageComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
    CaSpaceCoreModule,
  ]
})
export class CaJoinSpacePageModule { }
