import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {FlInfiniteScrollMode} from '@monorepo/front-core-lib';

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
export class BioxResourceTextComponent implements OnInit {

  @Input() resource: BioxResource;

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
    const data: any = this.resource.data;
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
