import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CoreModule} from '../core/core.module';
import { UserCompleteInfoPageComponent } from './component/user-complete-info-page/user-complete-info-page.component';
import { OrganisationFormComponent } from './component/organisation-form/organisation-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

/**
 * Page used when the user logged for the first time
 *
 * It will asked him to provided information (such as organization).
 */
@NgModule({
  declarations: [UserCompleteInfoPageComponent, OrganisationFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
  ]
})
export class UserCompleteInfoPageModule { }
