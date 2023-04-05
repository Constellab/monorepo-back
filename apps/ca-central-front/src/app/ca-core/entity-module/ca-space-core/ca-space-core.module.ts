import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSpaceTableComponent} from './component/ca-space-table/ca-space-table.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaSpaceFormDialogComponent} from './component/ca-space-form-dialog/ca-space-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CaSpaceUserTableComponent} from './component/ca-space-user-table/ca-space-user-table.component';
import {CaSpacePhotoPipe} from './pipe/ca-space-photo.pipe';
import {CaSpacePhotoComponent} from './component/ca-space-photo/ca-space-photo.component';
import {CaSpaceInlineComponent} from './component/ca-space-inline/ca-space-inline.component';
import {CaExternalSpaceLinkDirective} from './pipe/ca-external-space-link.directive';
import {CaSpaceSearchComponent} from './component/ca-space-search/ca-space-search.component';
import {CaSpaceSearchFormComponent} from './component/ca-space-search-form/ca-space-search-form.component';
import {CaSpaceUserSearchComponent} from './component/ca-space-user-search/ca-space-user-search.component';
import {
  CaSpaceUserSearchFormComponent
} from './component/ca-space-user-search-form/ca-space-user-search-form.component';
import {MatBadgeModule} from '@angular/material/badge';
import {CaSelectSpaceComponent} from './component/ca-select-space/ca-select-space.component';


@NgModule({
  declarations: [
    CaSpaceTableComponent,
    CaSpaceFormDialogComponent,
    CaSpaceUserTableComponent,
    CaSpacePhotoPipe,
    CaSpacePhotoComponent,
    CaSpaceInlineComponent,
    CaExternalSpaceLinkDirective,
    CaSpaceSearchComponent,
    CaSpaceSearchFormComponent,
    CaSpaceUserSearchComponent,
    CaSpaceUserSearchFormComponent,
    CaSelectSpaceComponent,
  ],
  exports: [
    CaSpaceTableComponent,
    CaSpaceFormDialogComponent,
    CaSpaceUserTableComponent,
    CaSpacePhotoPipe,
    CaSpacePhotoComponent,
    CaSpaceInlineComponent,
    CaExternalSpaceLinkDirective,
    CaSpaceSearchComponent,
    CaSpaceSearchFormComponent,
    CaSpaceUserSearchComponent,
    CaSpaceUserSearchFormComponent,
    CaSelectSpaceComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
    MatBadgeModule,
  ],
})
export class CaSpaceCoreModule {
}
