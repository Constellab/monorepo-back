import {Component, OnInit} from '@angular/core';

/**
 * Container for the {@link FlArticleComponent}, {@link FlArticleLeftSideComponent} and {@link FlArticleRightSideComponent}
 *
 * This is to have a readable (not too wide) center part with two section aside. The sections are also limited is width
 *
 * When printing the article, the left and right side are hidden and the center part is printed in full width
 */
@Component({
  selector: 'fl-article-container',
  templateUrl: './fl-article-container.component.html',
  styleUrls: ['./fl-article-container.component.scss']
})
export class FlArticleContainerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
