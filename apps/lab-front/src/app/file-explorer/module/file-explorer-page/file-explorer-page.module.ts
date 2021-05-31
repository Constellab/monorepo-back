import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {FileExplorerPageComponent} from './component/file-explorer-page/file-explorer-page.component';
import {FileResourceTableComponent} from './component/file-resource-table/file-resource-table.component';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    FileExplorerPageComponent,
    FileResourceTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    CoreModule,
  ]
})
export class FileExplorerPageModule {
}
