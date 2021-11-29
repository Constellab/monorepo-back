import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileExplorerPageModule} from './module/file-explorer-page/file-explorer-page.module';
import {FileExplorerRoutingModule} from './file-explorer-routing.module';
import {BioxResourceSearchPageModule} from './module/biox-resource-search-page/biox-resource-search-page.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    FileExplorerPageModule,
    BioxResourceSearchPageModule,

    FileExplorerRoutingModule,
  ]
})
export class FileExplorerModule { }
