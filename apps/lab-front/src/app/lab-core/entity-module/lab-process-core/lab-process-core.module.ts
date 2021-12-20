import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabProcessTypesTreeComponent} from './component/lab-process-types-tree/lab-process-types-tree.component';
import {LabCoreModule} from '../../lab-core.module';
import {LabProcessDocComponent} from './component/lab-process-doc/lab-process-doc.component';
import {LabProcessTypeCardComponent} from './component/lab-process-type-card/lab-process-type-card.component';
import {LabProcessPortColorPipe} from './pipe/lab-process-port-color.pipe';
import {LabProcessPortComponent} from './component/lab-process-port/lab-process-port.component';
import {LabProcessPortsListComponent} from './component/lab-process-ports-list/lab-process-ports-list.component';
import {LabProcessTypePortalComponent} from './component/lab-process-type-portal/lab-process-type-portal.component';
import {LabProcessTypeHoverDetailDirective} from './directive/lab-process-type-hover-detail.directive';


@NgModule({
  declarations: [
    LabProcessTypesTreeComponent,
    LabProcessDocComponent,
    LabProcessTypeCardComponent,
    LabProcessPortComponent,
    LabProcessPortsListComponent,
    LabProcessTypePortalComponent,

    LabProcessPortColorPipe,

    LabProcessTypeHoverDetailDirective,
  ],
  exports: [
    LabProcessTypesTreeComponent,
    LabProcessDocComponent,
    LabProcessTypeCardComponent,
    LabProcessPortComponent,
    LabProcessPortsListComponent,
    LabProcessTypePortalComponent,

    LabProcessPortColorPipe,

    LabProcessTypeHoverDetailDirective,
  ],
  imports: [
    CommonModule,

    LabCoreModule,

  ],
})
export class LabProcessCoreModule {
}
