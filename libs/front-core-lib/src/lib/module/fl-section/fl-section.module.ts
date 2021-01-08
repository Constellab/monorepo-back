import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlSectionComponent} from './fl-section/fl-section.component';
import {FlSectionHeaderComponent} from './fl-section-header/fl-section-header.component';
import {FlSectionActionsComponent} from './fl-section-actions/fl-section-actions.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {FlSectionBodyDirective} from './fl-section-body';
import {PortalModule} from '@angular/cdk/portal';
import {FlAsyncSectionComponent} from './fl-async-section/fl-async-section.component';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';

/**
 * Module SectionList which is a section of a page displaying a list of element
 */
@NgModule({
  declarations: [
    FlSectionComponent,
    FlSectionHeaderComponent,
    FlSectionActionsComponent,
    FlSectionBodyDirective,
    FlAsyncSectionComponent,
  ],
  exports: [
    FlSectionComponent,
    FlSectionHeaderComponent,
    FlSectionActionsComponent,
    FlSectionBodyDirective,
    FlAsyncSectionComponent
  ],
  imports: [
    CommonModule,

    MatIconModule,
    PortalModule,
    FlexLayoutModule,

    FlLoaderModule,
    FlTranslateModule,
  ]
})
export class FlSectionModule {
}
