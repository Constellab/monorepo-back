import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlArticleComponent} from './component/fl-article/fl-article.component';
import {FlArticleContainerComponent} from './component/fl-article-container/fl-article-container.component';
import {FlArticleLeftSideComponent} from './component/fl-article-left-side/fl-article-left-side.component';
import {FlArticleRightSideComponent} from './component/fl-article-right-side/fl-article-right-side.component';
import {FlexLayoutModule} from '@angular/flex-layout';

/**
 *  Module for article component to have an article like layout
 */
@NgModule({
  declarations: [
    FlArticleComponent,
    FlArticleContainerComponent,
    FlArticleLeftSideComponent,
    FlArticleRightSideComponent
  ],
  exports: [
    FlArticleComponent,
    FlArticleContainerComponent,
    FlArticleLeftSideComponent,
    FlArticleRightSideComponent
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
  ],
})
export class FlArticleModule { }
