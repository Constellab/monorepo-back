import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HaPublicListBricksPageComponent} from './ha-public-list-bricks-page/ha-public-list-bricks-page.component';
import {HaPublicEditBrickPageComponent} from './ha-public-edit-brick-page/ha-public-edit-brick-page.component';
import {HaPublicEditBrickFormComponent} from './ha-public-edit-brick-form/ha-public-edit-brick-form.component';
import {TranslateModule} from "@ngx-translate/core";
import {ReactiveFormsModule} from "@angular/forms";
import {HaCoreModule} from '../../../ha-core/ha-core.module';
import {MatRadioModule} from "@angular/material/radio";
import {HaPublicCoreModule} from '../ha-public-core/ha-public-core.module';
import {FlKeyValueModule} from "@monorepo/front-core-lib";


@NgModule({
  declarations: [HaPublicListBricksPageComponent, HaPublicEditBrickPageComponent, HaPublicEditBrickFormComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    HaCoreModule,
    MatRadioModule,
    HaPublicCoreModule,
    FlKeyValueModule
  ]
})
export class HaPublicListBricksPageModule {

}
