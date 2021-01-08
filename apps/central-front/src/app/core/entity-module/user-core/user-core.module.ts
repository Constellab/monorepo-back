import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserInlineComponent} from './component/user-inline/user-inline.component';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {SelectUserOptionsComponent} from './component/select-user-options/select-user-options.component';
import {AuthenticatedUserInlineComponent} from './component/authenticated-user-inline/authenticated-user-inline.component';
import {UserTableComponent} from './component/user-table/user-table.component';
import {CustomLibraryModule} from '../../lib/custom-library.module';

/**
 * Module containing users component
 */
@NgModule({
  declarations: [
    UserInlineComponent,
    SelectUserOptionsComponent,
    AuthenticatedUserInlineComponent,
    UserTableComponent,
  ],
  exports: [
    UserInlineComponent,
    SelectUserOptionsComponent,
    AuthenticatedUserInlineComponent,
    UserTableComponent,
  ],
  imports: [
    CommonModule,

    CustomMaterialModule,
    CustomLibraryModule,
  ]
})
export class UserCoreModule {
}
