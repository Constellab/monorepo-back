import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatLegacyRadioModule as MatRadioModule} from "@angular/material/legacy-radio";
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {TranslateModule} from '@ngx-translate/core';
import {FlCoreDirectiveModule, FlCorePipeModule} from '@monorepo/front-core-lib';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';


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
