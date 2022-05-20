import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlInputFileContainerComponent} from './fl-input-file-container/fl-input-file-container.component';
import {FlInputFileDirective} from './fl-input-file.directive';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flFileInputI18n} from './i18n/fl-input-file.i18n';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';
import {FlInputFileIconContainerComponent} from './fl-input-file-icon-container/fl-input-file-icon-container.component';
import {MatRippleModule} from '@angular/material/core';
import {FlDragModule} from '../fl-drag/fl-drag.module';

/**
 * Form input to manage file
 */
@NgModule({
  declarations: [
    FlInputFileContainerComponent,
    FlInputFileDirective,
    FlInputFileIconContainerComponent
  ],
  exports: [
    FlInputFileDirective,
    FlInputFileContainerComponent,
    FlInputFileIconContainerComponent,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatRippleModule,
    FlexLayoutModule,

    FlDragModule,
    FlTranslateModule,
    FlIconModule,
  ]
})
export class FlInputFileModule {
  constructor(translateServie: FlTranslateService) {
    translateServie.addModuleTranslation('FlInputFileModule', flFileInputI18n);
  }
}
