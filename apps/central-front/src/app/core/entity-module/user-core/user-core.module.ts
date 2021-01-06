import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserInlineComponent} from './component/user-inline/user-inline.component';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {ImageModule} from '../../module/image/image.module';
import {SelectUserOptionsComponent} from './component/select-user-options/select-user-options.component';
import {AuthenticatedUserInlineComponent} from './component/authenticated-user-inline/authenticated-user-inline.component';
import {CoreTranslateModule} from '../../module/translate/core-translate.module';
import {UserTableComponent} from './component/user-table/user-table.component';
import {CorePipeModule} from '../../module/core-pipe/core-pipe.module';

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

    ImageModule,
    CoreTranslateModule,
    CorePipeModule,
  ]
})
export class UserCoreModule {
}
