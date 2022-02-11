import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTextEditorComponent} from './component/fl-text-editor/fl-text-editor.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {
  FlTextEditorBlockAddButtonComponent
} from './component/fl-text-editor-block-add-button/fl-text-editor-block-add-button.component';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FlInputFileModule} from '../fl-input-file/fl-input-file.module';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlTextEditorFigureComponent} from './component/fl-text-editor-figure/fl-text-editor-figure.component';
import {createCustomElement} from '@angular/elements';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flTextEditorI18n} from './i18n/fl-text-editor.i18n';
import {FlexLayoutModule} from '@angular/flex-layout';


@NgModule({
  declarations: [
    FlTextEditorComponent,
    FlTextEditorBlockAddButtonComponent,
    FlTextEditorFigureComponent,
  ],
  exports: [
    FlTextEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FlexLayoutModule,

    FlPortalModule,
    FlInputFileModule,
    FlCoreDirectiveModule,
    FlTranslateModule,
  ],
})
export class FlTextEditorModule {
  private static registered: boolean = false;

  constructor(injector: Injector, translateService: FlTranslateService) {
    if (FlTextEditorModule.registered) return;
    // declare the FlTextEditorFigureComponent as angular element to make the tag
    // fl-text-editor-figure
    customElements.define('fl-text-editor-figure',
      createCustomElement(FlTextEditorFigureComponent, {
        injector,
      }));

    FlTextEditorModule.registered = true;

    translateService.addModuleTranslation('FlTextEditorModule', flTextEditorI18n);

  }
}
