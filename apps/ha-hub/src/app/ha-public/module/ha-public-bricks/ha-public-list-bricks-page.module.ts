import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HaPublicListBricksPageComponent} from './ha-public-list-bricks-page/ha-public-list-bricks-page.component';
import {HaCustomMaterialModule} from '../../../ha-core/ha-custom-material/ha-custom-material.module';
import {HaPublicEditBrickPageComponent} from './ha-public-list-bricks-page/ha-public-edit-brick-page/ha-public-edit-brick-page.component';
import {HaPublicEditBrickFormComponent} from './ha-public-list-bricks-page/ha-public-edit-brick-form/ha-public-edit-brick-form.component';
import {TranslateModule} from "@ngx-translate/core";
import {ReactiveFormsModule} from "@angular/forms";
import {HaCoreModule} from '../../../ha-core/ha-core.module';


@NgModule({
  declarations: [HaPublicListBricksPageComponent, HaPublicEditBrickPageComponent, HaPublicEditBrickFormComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    HaCoreModule
  ]
})
export class HaPublicListBricksPageModule {
}
