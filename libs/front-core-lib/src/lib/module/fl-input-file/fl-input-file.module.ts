import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlInputFileContainerComponent} from './lib-input-file-container/fl-input-file-container.component';
import {FlInputFileDirective} from './fl-input-file.directive';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';

/**
 * Form input to manage file
 */
@NgModule({
  declarations: [
    FlInputFileContainerComponent,
    FlInputFileDirective
  ],
  exports: [
    FlInputFileDirective,
    FlInputFileContainerComponent,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DragDropModule,
    FlexLayoutModule,

    FlCoreDirectiveModule,
    FlTranslateModule,
  ]
})
export class FlInputFileModule {
}
