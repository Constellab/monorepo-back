import {Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTextEditorComponent} from './component/fl-text-editor/fl-text-editor.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {
  FlTextEditorBlockAddButtonComponent
} from './component/fl-text-editor-block-add-button/fl-text-editor-block-add-button.component';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FlInputFileModule} from '../fl-input-file/fl-input-file.module';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlTextEditorFigureComponent} from './component/fl-text-editor-figure/fl-text-editor-figure.component';
import {createCustomElement} from '@angular/elements';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flTextEditorI18n} from './i18n/fl-text-editor.i18n';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlResizeModule} from '../fl-resize/fl-resize.module';
import Quill from 'quill';
import {FlTextEditorModuleConfig, FlTextEditorModuleConfigBlot} from './model/fl-text-editor-module-config.class';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {
  FlTextEditorTitleCaptionComponent
} from './component/fl-text-editor-title-caption/fl-text-editor-title-caption.component';
import {FlTextEditorHintBlot} from './model/fl-text-editor-hint-blot.class';
import {
  FlTextEditorDragButtonsComponent
} from './component/fl-text-editor-drag-buttons/fl-text-editor-drag-buttons.component';
import {FlTextEditorVideoComponent} from './component/fl-text-editor-video/fl-text-editor-video.component';
import {
  FlTextEditorLinkDialogComponent
} from './component/fl-text-editor-link-dialog/fl-text-editor-link-dialog.component';
import {FlDialogModule} from '../fl-dialog/fl-dialog.module';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlTextEditorHeaderId} from './model/fl-text-editor-header-id.class';
import {FlTextEditorLink} from './model/fl-text-editor-link-without-target.class';
import {FlTextEditorDirective} from './directive/fl-text-editor.directive';
import {
  FlTextEditorSnowButtonComponent
} from './component/fl-text-editor-snow-button/fl-text-editor-snow-button.component';
import {FlTextEditorFormulaComponent} from './component/fl-text-editor-formula/fl-text-editor-formula.component';
import {
  FlTextEditorFormulaDialogComponent
} from './component/fl-text-editor-formula-dialog/fl-text-editor-formula-dialog.component';
import {FlTextEditorFigureBlot} from './model/fl-text-editor-figure-blot.class';
import {FlTextEditorFormulaBlot} from './model/fl-text-editor-formula-blot.class';
import {FlTextEditorVideoBlot} from './model/fl-text-editor-video-blot.class';


@NgModule({
  declarations: [
    FlTextEditorComponent,
    FlTextEditorBlockAddButtonComponent,
    FlTextEditorFigureComponent,
    FlTextEditorTitleCaptionComponent,
    FlTextEditorDragButtonsComponent,
    FlTextEditorVideoComponent,
    FlTextEditorLinkDialogComponent,
    FlTextEditorSnowButtonComponent,
    FlTextEditorDirective,
    FlTextEditorFormulaComponent,
    FlTextEditorFormulaDialogComponent,
  ],
  exports: [
    FlTextEditorComponent,
    FlTextEditorTitleCaptionComponent,
    FlTextEditorDirective,
    FlTextEditorFormulaComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatFormFieldModule,
    FlexLayoutModule,

    FlPortalModule,
    FlInputFileModule,
    FlCoreDirectiveModule,
    FlCorePipeModule,
    FlTranslateModule,
    FlResizeModule,
    FlDialogModule,
  ],
})
export class FlTextEditorModule {
  private static registered: boolean = false;

  private static config: FlTextEditorModuleConfig;

  constructor(injector: Injector, translateService: FlTranslateService) {
    if (FlTextEditorModule.registered) return;

    // register default blots
    Quill.register(FlTextEditorHintBlot, true);
    Quill.register(FlTextEditorHeaderId, true);
    Quill.register(FlTextEditorLink, true);

    FlTextEditorModule.registered = true;

    translateService.addModuleTranslation('FlTextEditorModule', flTextEditorI18n);

    const blots: FlTextEditorModuleConfigBlot[] = [
      {blot: FlTextEditorFigureBlot, componentType: FlTextEditorFigureComponent},
      {blot: FlTextEditorFormulaBlot, componentType: FlTextEditorFormulaComponent},
      {blot: FlTextEditorVideoBlot, componentType: FlTextEditorVideoComponent},
      ...FlTextEditorModule.config.blots
    ]

    // Register quill blots
    for (const blot of blots) {
      Quill.register(blot.blot, true);

      // declare the FlTextEditorFigureComponent as angular element to make the tag
      // fl-text-editor-figure
      customElements.define(blot.blot.tagName.toLowerCase(),
        createCustomElement(blot.componentType, {injector: injector}));
    }
  }

  public static forRoot(config: FlTextEditorModuleConfig): ModuleWithProviders<FlTextEditorModule> {
    FlTextEditorModule.config = config;

    return {
      ngModule: FlTextEditorModule,
    };
  }
}
