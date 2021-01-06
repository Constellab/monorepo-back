import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardComponent} from './card/card.component';
import {CardImageComponent} from './card-image/card-image.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CardActionsComponent} from './card-actions/card-actions.component';
import {CardBodyComponent} from './card-body/card-body.component';
import {CardHeaderComponent} from './card-header/card-header.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ImageModule} from '../image/image.module';
import {CardFooterComponent} from './card-footer/card-footer.component';

/**
 * Custom card with colored header
 */
@NgModule({
  declarations: [
    CardComponent,
    CardHeaderComponent,
    CardActionsComponent,
    CardBodyComponent,
    CardImageComponent,
    CardFooterComponent,
  ],
  exports: [
    CardComponent,
    CardHeaderComponent,
    CardActionsComponent,
    CardBodyComponent,
    CardImageComponent,
    CardFooterComponent,
  ],
  imports: [
    CommonModule,
    ImageModule,
    FlexLayoutModule,
    ScrollingModule,
  ]
})
export class CardModule {
}
