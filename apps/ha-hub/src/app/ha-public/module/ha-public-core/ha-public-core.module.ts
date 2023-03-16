import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {TranslateModule} from '@ngx-translate/core';
import {FlCoreDirectiveModule, FlCorePipeModule} from '@monorepo/front-core-lib';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';


@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    FlCorePipeModule,
    ReactiveFormsModule,
    MatInputModule,
    FlCoreDirectiveModule
  ]
})
export class HaPublicCoreModule {
}
