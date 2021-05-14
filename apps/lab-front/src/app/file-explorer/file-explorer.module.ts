import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileExplorerPageModule} from './module/file-explorer-page/file-explorer-page.module';
import {FileExplorerRoutingModule} from './file-explorer-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    FileExplorerPageModule,

    FileExplorerRoutingModule,
  ]
})
export class FileExplorerModule { }
