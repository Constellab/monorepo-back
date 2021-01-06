import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SectionComponent} from './section/section.component';
import {SectionHeaderComponent} from './section-header/section-header.component';
import {SectionActionsComponent} from './section-actions/section-actions.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {LoaderModule} from '../loader/loader.module';
import {MatIconModule} from '@angular/material/icon';
import {CoreTranslateModule} from '../translate/core-translate.module';
import {SectionBodyDirective} from './section-body';
import {PortalModule} from '@angular/cdk/portal';
import {AsyncSectionComponent} from './async-section/async-section.component';

/**
 * Module SectionList which is a section of a page displaying a list of element
 */
@NgModule({
  declarations: [
    SectionComponent,
    SectionHeaderComponent,
    SectionActionsComponent,
    SectionBodyDirective,
    AsyncSectionComponent,
  ],
  exports: [
    SectionComponent,
    SectionHeaderComponent,
    SectionActionsComponent,
    SectionBodyDirective,
    AsyncSectionComponent
  ],
  imports: [
    CommonModule,
    LoaderModule,
    MatIconModule,
    CoreTranslateModule,
    PortalModule,

    FlexLayoutModule,
  ]
})
export class SectionModule {
}
