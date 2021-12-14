import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudyCardComponent} from './component/study-card/study-card.component';
import {CoreModule} from '../../../core/core.module';
import {StudyFormDialogComponent} from './component/study-form-dialog/study-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StudyInfoComponent} from './component/study-info/study-info.component';


@NgModule({
  declarations: [
    StudyCardComponent,
    StudyFormDialogComponent,
    StudyInfoComponent,
  ],
  exports: [
    StudyCardComponent,
    StudyFormDialogComponent,
    StudyInfoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
  ]
})
export class StudyCoreModule {
}
