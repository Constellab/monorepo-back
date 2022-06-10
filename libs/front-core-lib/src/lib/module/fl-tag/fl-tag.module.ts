import {ModuleWithProviders, NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTagInputComponent} from './component/fl-tag-input/fl-tag-input.component';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flTagI18n} from './fl-tag.i18n';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlTagService} from './fl-tag.class';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlTagComponent} from './component/fl-tag/fl-tag.component';
import {FlTagFormDialogComponent} from './component/fl-tag-form-dialog/fl-tag-form-dialog.component';
import {FlDialogModule} from '../fl-dialog/fl-dialog.module';
import {MatButtonModule} from '@angular/material/button';
import {FlTagDialogService} from './fl-tag-dialog.service';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlTagListComponent} from './component/fl-tag-list/fl-tag-list.component';
import {FlTagsSelectColorsComponent} from './component/fl-tags-select-colors/fl-tags-select-colors.component';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {FlColorModule} from '../fl-color/fl-color.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlTagColorPipe} from './pipe/fl-tag-color.pipe';
import {MatRippleModule} from '@angular/material/core';
import {FlTagsToListPipe} from './pipe/fl-tags-to-list.pipe';


@NgModule({
  declarations: [
    FlTagInputComponent,
    FlTagComponent,
    FlTagFormDialogComponent,
    FlTagListComponent,
    FlTagsSelectColorsComponent,
    FlTagColorPipe,
    FlTagsToListPipe
  ],
  exports: [
    FlTagInputComponent,
    FlTagComponent,
    FlTagFormDialogComponent,
    FlTagListComponent,
    FlTagsSelectColorsComponent,
    FlTagColorPipe,
    FlTagsToListPipe,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    DragDropModule,
    MatButtonModule,
    FlexLayoutModule,
    MatTooltipModule,
    MatRippleModule,

    FlTranslateModule,
    FlDialogModule,
    FlLoaderModule,
    FlCoreDirectiveModule,
    FlCorePipeModule,
    FlCoreComponentModule,
    FlColorModule,
  ],
})
export class FlTagModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlTagModule', flTagI18n);
  }

  public static forRoot(tagService: Type<FlTagService>): ModuleWithProviders<FlTagModule> {
    return {
      ngModule: FlTagModule,
      providers: [
        {
          provide: FlTagService, useClass: tagService
        },
        FlTagDialogService,
      ]
    };
  }
}
