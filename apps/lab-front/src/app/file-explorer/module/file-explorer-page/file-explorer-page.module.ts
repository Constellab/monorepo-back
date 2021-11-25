import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {FileExplorerPageComponent} from './component/file-explorer-page/file-explorer-page.component';
import {FileResourceTableComponent} from './component/file-resource-table/file-resource-table.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {UploadFsNodeDialogComponent} from './component/upload-fs-node-dialog/upload-fs-node-dialog.component';


@NgModule({
  declarations: [
    FileExplorerPageComponent,
    FileResourceTableComponent,
    UploadFsNodeDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,

    CoreModule,
  ]
})
export class FileExplorerPageModule {
}
