import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxProcessTypeCardComponent} from './component/biox-process-type-card/biox-process-type-card.component';
import {CoreModule} from '../../core.module';
import {BioxProcessTypesTreeComponent} from './component/biox-process-types-tree/biox-process-types-tree.component';
import {BioxProcessPortsListComponent} from './component/biox-process-ports-list/biox-process-ports-list.component';
import {BioxProcessPortComponent} from './component/biox-process-port/biox-process-port.component';
import {BioxProcessPortColorPipe} from './pipe/biox-process-port-color.pipe';
import {BioxProcessTypeDocComponent} from './component/biox-process-type-doc/biox-process-type-doc.component';


@NgModule({
  declarations: [
    BioxProcessTypeCardComponent,
    BioxProcessTypesTreeComponent,
    BioxProcessPortsListComponent,
    BioxProcessPortComponent,
    BioxProcessPortColorPipe,
    BioxProcessTypeDocComponent
  ],
  exports: [
    BioxProcessTypeCardComponent,
    BioxProcessTypesTreeComponent,
    BioxProcessPortsListComponent,
    BioxProcessPortComponent,
    BioxProcessTypeDocComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
  ]
})
export class BioxProcessTypeModule {
}
