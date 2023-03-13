import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FlResizePortalFullscreenButtonComponent
} from './fl-resize-fullscreen-button/fl-resize-portal-fullscreen-button.component';
import {FlResizeDirective} from './fl-resize/fl-resize.directive';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flResizeI18n} from './fl-resize.i18n';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';


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
