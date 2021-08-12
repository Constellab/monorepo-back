import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxProcessableTypesTreeComponent} from './component/biox-processable-types-tree/biox-processable-types-tree.component';
import {CoreModule} from '../../core.module';
import {BioxProcessableDocComponent} from './component/biox-processable-doc/biox-processable-doc.component';
import {BioxProcessableTypeCardComponent} from './component/biox-processable-type-card/biox-processable-type-card.component';
import {BioxProcessPortColorPipe} from './pipe/biox-process-port-color.pipe';
import {BioxProcessablePortComponent} from './component/biox-processable-port/biox-processable-port.component';
import {BioxProcessablePortsListComponent} from './component/biox-processable-ports-list/biox-processable-ports-list.component';


@NgModule({
  declarations: [
    BioxProcessableTypesTreeComponent,
    BioxProcessableDocComponent,
    BioxProcessableTypeCardComponent,
    BioxProcessablePortComponent,
    BioxProcessablePortsListComponent,

    BioxProcessPortColorPipe,
  ],
  exports: [
    BioxProcessableTypesTreeComponent,
    BioxProcessableDocComponent,
    BioxProcessableTypeCardComponent,
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
