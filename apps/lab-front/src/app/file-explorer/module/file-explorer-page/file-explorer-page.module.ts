import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {FileExplorerPageComponent} from './component/file-explorer-page/file-explorer-page.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {UploadFsNodeDialogComponent} from './component/upload-fs-node-dialog/upload-fs-node-dialog.component';
import {BioxResourceCoreModule} from '../../../core/entity-module/biox-resource-core/biox-resource-core.module';


@NgModule({
  declarations: [
    FileExplorerPageComponent,
    UploadFsNodeDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,

    CoreModule,

    BioxResourceCoreModule,
  ]
})
export class FileExplorerPageModule {
}
