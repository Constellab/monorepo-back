import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxProcessTypesTreeComponent} from './component/biox-process-types-tree/biox-process-types-tree.component';
import {CoreModule} from '../../core.module';
import {BioxProcessDocComponent} from './component/biox-process-doc/biox-process-doc.component';
import {BioxProcessTypeCardComponent} from './component/biox-process-type-card/biox-process-type-card.component';
import {BioxProcessPortColorPipe} from './pipe/biox-process-port-color.pipe';
import {BioxProcessPortComponent} from './component/biox-process-port/biox-process-port.component';
import {BioxProcessPortsListComponent} from './component/biox-process-ports-list/biox-process-ports-list.component';
import {BioxProcessTypePortalComponent} from './component/biox-process-type-portal/biox-process-type-portal.component';
import {BioxProcessTypeHoverDetailDirective} from './directive/biox-process-type-hover-detail.directive';


@NgModule({
  declarations: [
    BioxProcessTypesTreeComponent,
    BioxProcessDocComponent,
    BioxProcessTypeCardComponent,
    BioxProcessPortComponent,
    BioxProcessPortsListComponent,
    BioxProcessTypePortalComponent,

    BioxProcessPortColorPipe,

    BioxProcessTypeHoverDetailDirective,
  ],
  exports: [
    BioxProcessTypesTreeComponent,
    BioxProcessDocComponent,
    BioxProcessTypeCardComponent,
    BioxProcessPortComponent,
    BioxProcessPortsListComponent,
    BioxProcessTypePortalComponent,

    BioxProcessPortColorPipe,

    BioxProcessTypeHoverDetailDirective,
  ],
  imports: [
    CommonModule,

    CoreModule,

  ],
})
export class BioxProcessCoreModule {
}
