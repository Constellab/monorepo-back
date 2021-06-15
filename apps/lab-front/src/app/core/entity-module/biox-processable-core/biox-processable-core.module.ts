import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxProcessableSpecsTreeComponent} from './component/biox-processable-specs-tree/biox-processable-specs-tree.component';
import {CoreModule} from '../../core.module';
import {BioxProcessableDocComponent} from './component/biox-processable-doc/biox-processable-doc.component';
import {BioxProcessableSpecCardComponent} from './component/biox-processable-spec-card/biox-processable-spec-card.component';
import {BioxProcessPortColorPipe} from './pipe/biox-process-port-color.pipe';
import {BioxProcessablePortComponent} from './component/biox-processable-port/biox-processable-port.component';
import {BioxProcessablePortsListComponent} from './component/biox-processable-ports-list/biox-processable-ports-list.component';


@NgModule({
  declarations: [
    BioxProcessableSpecsTreeComponent,
    BioxProcessableDocComponent,
    BioxProcessableSpecCardComponent,
    BioxProcessablePortComponent,
    BioxProcessablePortsListComponent,

    BioxProcessPortColorPipe,
  ],
  exports: [
    BioxProcessableSpecsTreeComponent,
    BioxProcessableDocComponent,
    BioxProcessableSpecCardComponent,
    BioxProcessablePortComponent,
    BioxProcessablePortsListComponent,

    BioxProcessPortColorPipe,
  ],
  imports: [
    CommonModule,

    CoreModule,

  ],
})
export class BioxProcessableCoreModule {
}
