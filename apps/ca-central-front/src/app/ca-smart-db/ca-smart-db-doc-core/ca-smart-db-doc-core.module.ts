import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSmartDbHighlightPipe} from './pipe/ca-smart-db-highlight.pipe';
import {
  CaSmartDbSentenceDetailComponent
} from './component/ca-smart-db-sentence-detail/ca-smart-db-sentence-detail.component';
import {CaSmartDbVerbEffectPipe} from './pipe/ca-smart-db-verb-effect.pipe';
import {CaSmartDbHighlightContentPipe} from './pipe/ca-smart-db-highlight-content.pipe';
import {CaSmartDbDocCardComponent} from './component/ca-smart-db-doc-card/ca-smart-db-doc-card.component';
import {CaSmartDbContentComponent} from './component/ca-smart-db-content/ca-smart-db-content.component';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    CaSmartDbHighlightPipe,
    CaSmartDbSentenceDetailComponent,
    CaSmartDbVerbEffectPipe,
    CaSmartDbHighlightContentPipe,
    CaSmartDbDocCardComponent,
    CaSmartDbContentComponent,
  ],
  exports: [
    CaSmartDbHighlightPipe,
    CaSmartDbSentenceDetailComponent,
    CaSmartDbVerbEffectPipe,
    CaSmartDbHighlightContentPipe,
    CaSmartDbDocCardComponent,
    CaSmartDbContentComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
  ]
})
export class CaSmartDbDocCoreModule {
}
