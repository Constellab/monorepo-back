import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FileExplorerPageComponent} from './module/file-explorer-page/component/file-explorer-page/file-explorer-page.component';

const routes: Routes = [
  {path: '', component: FileExplorerPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileExplorerRoutingModule {
}
