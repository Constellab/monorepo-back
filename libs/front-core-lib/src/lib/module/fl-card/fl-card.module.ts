import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlCardComponent} from './fl-card/fl-card.component';
import {FlCardImageComponent} from './fl-card-image/fl-card-image.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlCardActionsComponent} from './fl-card-actions/fl-card-actions.component';
import {FlCardBodyComponent} from './fl-card-body/fl-card-body.component';
import {FlCardHeaderComponent} from './fl-card-header/fl-card-header.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {FlCardFooterComponent} from './fl-card-footer/fl-card-footer.component';
import {FlImageModule} from '../fl-image';

/**
 * Custom card with colored header
 */
@NgModule({
  declarations: [
    FlCardComponent,
    FlCardHeaderComponent,
    FlCardActionsComponent,
    FlCardBodyComponent,
    FlCardImageComponent,
    FlCardFooterComponent,
  ],
  exports: [
    FlCardComponent,
    FlCardHeaderComponent,
    FlCardActionsComponent,
    FlCardBodyComponent,
    FlCardImageComponent,
    FlCardFooterComponent,
  ],
  imports: [
    CommonModule,
    FlImageModule,
    FlexLayoutModule,
    ScrollingModule,
  ]
})
export class FlCardModule {
}
