import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabTechnicalDocComponent} from './component/lab-technical-doc/lab-technical-doc.component';
import {LabDocRoutingModule} from './lab-doc-routing.module';
import {LabCoreModule} from '../lab-core/lab-core.module';
import {LabTypeCoreModule} from '../lab-core/entity-module/lab-type-core/lab-type-core.module';

@NgModule({
  declarations: [
    LabTechnicalDocComponent
  ],
  imports: [
    CommonModule,
    LabCoreModule,
    LabTypeCoreModule,

    LabDocRoutingModule,
  ]
})
export class LabDocModule {
}
