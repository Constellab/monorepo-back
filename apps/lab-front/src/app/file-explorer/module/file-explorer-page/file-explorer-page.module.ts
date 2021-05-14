import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {FileExplorerPageComponent} from './component/file-explorer-page/file-explorer-page.component';
import {FileResourceTableComponent} from './component/file-resource-table/file-resource-table.component';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [FileExplorerPageComponent, FileResourceTableComponent],
  imports: [
    CommonModule,
    FormsModule,

    CoreModule,
  ]
})
export class FileExplorerPageModule {
}
