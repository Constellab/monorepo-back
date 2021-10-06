import {Component, Input, OnInit} from '@angular/core';
import {FlInfiniteScrollMode} from '@monorepo/front-core-lib';
import {BioxResourceViewComponent} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewText} from '../../../../model/entities/resource/biox-resource-view.entity';

/**
 * Component to view a resource as plain text
 *
 * Support lazy text loading
 */
@Component({
  selector: 'gen-biox-resource-text',
  templateUrl: './biox-resource-text.component.html',
  styleUrls: ['./biox-resource-text.component.scss']
})
export class BioxResourceTextComponent implements OnInit, BioxResourceViewComponent<BioxResourceViewText> {

  @Input() view: BioxResourceViewText;

  @Input() infiniteScrollMode: FlInfiniteScrollMode = 'body';

  displayedText: string = '';
  private fullText: string;
  private page: number = 0;
  private readonly pageSize: number = 20000;

  textFullyLoaded: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.initText();
  }

  private initText(): void {
    const data: any = this.view.data;
    if (typeof data === 'string') {
      this.fullText = data;
    } else {
      this.fullText = JSON.stringify(data);
    }

    this.loadMoreText();
  }

  loadMoreText(): void {
    this.displayedText += this.fullText.substr(this.page * this.pageSize, this.pageSize);
    this.textFullyLoaded = this.displayedText.length >= this.fullText.length;
    this.page++;
  }

}
