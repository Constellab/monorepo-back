import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaOrganizationTableComponent} from './component/ca-organization-table/ca-organization-table.component';
import {CaCoreModule} from '../../ca-core.module';
import {
  CaOrganizationFormDialogComponent
} from './component/ca-organization-form-dialog/ca-organization-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {
  CaOrganizationUserTableComponent
} from './component/ca-organization-user-table/ca-organization-user-table.component';
import {CaOrganizationPhotoPipe} from './pipe/ca-organization-photo.pipe';
import {CaOrganizationPhotoComponent} from './component/ca-organization-photo/ca-organization-photo.component';
import {CaOrganizationInlineComponent} from './component/ca-organization-inline/ca-organization-inline.component';
import {
  CaSelectOrganizationOptionsComponent
} from './component/ca-select-organization-options/ca-select-organization-options.component';
import {
  CaExternalOrganizationLinkButtonComponent
} from './component/ca-external-organization-link-button/ca-external-organization-link-button.component';
import {CaExternalOrganizationLinkDirective} from './pipe/ca-external-organization-link.directive';


@NgModule({
  declarations: [
    CaOrganizationTableComponent,
    CaOrganizationFormDialogComponent,
    CaOrganizationUserTableComponent,
    CaOrganizationPhotoPipe,
    CaOrganizationPhotoComponent,
    CaOrganizationInlineComponent,
    CaSelectOrganizationOptionsComponent,
    CaExternalOrganizationLinkButtonComponent,
    CaExternalOrganizationLinkDirective,
  ],
  exports: [
    CaOrganizationTableComponent,
    CaOrganizationFormDialogComponent,
    CaOrganizationUserTableComponent,
    CaOrganizationPhotoPipe,
    CaOrganizationPhotoComponent,
    CaOrganizationInlineComponent,
    CaSelectOrganizationOptionsComponent,
    CaExternalOrganizationLinkButtonComponent,
    CaExternalOrganizationLinkDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
  ],
})
export class CaOrganizationCoreModule {
}
