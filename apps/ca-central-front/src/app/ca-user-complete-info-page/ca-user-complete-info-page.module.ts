import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {
  CaUserCompleteInfoPageComponent
} from './component/ca-user-complete-info-page/ca-user-complete-info-page.component';
import {CaOrganisationFormComponent} from './component/ca-organisation-form/ca-organisation-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

/**
 * Page used when the user logged for the first time
 *
 * It will ask him to provided information (such as organization).
 */
@NgModule({
  declarations: [
    CaUserCompleteInfoPageComponent,
    CaOrganisationFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
  ]
})
export class CaUserCompleteInfoPageModule { }
