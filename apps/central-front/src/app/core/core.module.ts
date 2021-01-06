import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreComponentModule} from './module/core-component/core-component.module';
import {CorePipeModule} from './module/core-pipe/core-pipe.module';
import {CoreDirectiveModule} from './module/core-directive/core-directive.module';
import {CustomMaterialModule} from './custom-material/custom-material.module';
import {LoaderModule} from './module/loader/loader.module';
import {CoreTranslateModule} from './module/translate/core-translate.module';
import {ImageModule} from './module/image/image.module';
import {CardModule} from './module/card/card.module';
import {TextIconModule} from './module/text-icon/text-icon.module';
import {CoreSelectModule} from './module/core-select/core-select.module';
import {SectionModule} from './module/section/section.module';
import {QuillModule} from 'ngx-quill';
import {CoreFormModule} from './module/core-form/core-form.module';
import {StatusModule} from './module/status/status.module';
import {UserCoreModule} from './entity-module/user-core/user-core.module';

/**
 * Core module of the app containing, component, services, directives and pipes
 * shared across the application
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    // export all core modules
    CoreComponentModule,
    CorePipeModule,
    CoreDirectiveModule,

    // other modules
    LoaderModule,
    CoreTranslateModule,
    ImageModule,
    CardModule,
    TextIconModule,
    CoreSelectModule,
    SectionModule,
    CoreFormModule,
    StatusModule,
    UserCoreModule,

    // Material Module
    CustomMaterialModule,

    // Quill
    QuillModule,
  ]
})
export class CoreModule {
}
