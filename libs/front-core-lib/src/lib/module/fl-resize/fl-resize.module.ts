import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FlResizePortalFullscreenButtonComponent
} from './fl-resize-fullscreen-button/fl-resize-portal-fullscreen-button.component';
import {FlResizeDirective} from './fl-resize/fl-resize.directive';
import {MatIconModule} from '@angular/material/icon';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flResizeI18n} from './fl-resize.i18n';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [
    FlResizePortalFullscreenButtonComponent,
    FlResizeDirective,
  ],
  exports: [
    FlResizePortalFullscreenButtonComponent,
    FlResizeDirective,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    FlTranslateModule,
  ],
})
export class FlResizeModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlResizeModule', flResizeI18n);
  }
}
