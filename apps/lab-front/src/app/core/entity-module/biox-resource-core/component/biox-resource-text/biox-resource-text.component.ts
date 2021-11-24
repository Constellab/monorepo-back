import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FlInfiniteScrollMode} from '@monorepo/front-core-lib';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewText, bioxResourceViewTextSpecPage} from '../../../../model/entities/resource/biox-resource-view.entity';
import {BioxResourceDetailPageState} from '../../../../../biox/module/biox-resource-detail-page/state/biox-resource-detail-page.state';

/**
 * Component to view a resource as plain text
 *
 * Support pagination to previous or next page
 */
@Component({
  selector: 'gen-biox-resource-text',
  templateUrl: './biox-resource-text.component.html',
  styleUrls: ['./biox-resource-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxResourceTextComponent extends BioxResourceViewDirective<BioxResourceViewText> implements OnInit {

  @Input() view: BioxResourceViewText;

  @Input() infiniteScrollMode: FlInfiniteScrollMode = 'body';

  text: string = '';

  private lowerPage: number = 1; // for loading previous page
  private higherPage: number = 1; // for loading next page

  reachedFirstPage: boolean = false;
  reachedLastPage: boolean = false;

  isLoading: boolean = false;

  constructor(private state: BioxResourceDetailPageState,
              private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.initText();
  }

  private initText(): void {
    this.reachedFirstPage = this.view.data.is_first_page;
    this.reachedLastPage = this.view.data.is_last_page;
    this.lowerPage = this.view.data.page;
    this.higherPage = this.view.data.page;

    this.text = this.toString(this.view.data.text);
  }

  loadNextPage(): void {
    this.isLoading = true;
    this.higherPage++;
    const paginationConfig = {[bioxResourceViewTextSpecPage]: this.higherPage};
    this.state.callPagination(paginationConfig).subscribe(
      view => this.loadNextPageSuccess(view as any),
      () => this.isLoading = false
    );
  }

  private loadNextPageSuccess(view: BioxResourceViewText): void {
    this.view.data.text += this.toString(view.data.text);
    this.text += this.toString(view.data.text);
    this.reachedLastPage = view.data.is_last_page;
    this.onSuccess();
  }

  loadPreviousPage(): void {
    this.isLoading = true;
    this.lowerPage--;
    const paginationConfig = {[bioxResourceViewTextSpecPage]: this.lowerPage};
    this.state.callPagination(paginationConfig).subscribe(
      view => this.loadPreviousPageSuccess(view as any),
      () => this.isLoading = false
    );
  }

  private loadPreviousPageSuccess(view: BioxResourceViewText): void {
    this.view.data.text = this.toString(view.data) + this.view.data;
    this.text = this.toString(view.data) + this.text;
    this.reachedFirstPage = view.data.is_first_page;
    this.onSuccess();
  }

  private onSuccess(): void {
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private toString(data: any): string {
    if (typeof data === 'string') {
      return data;
    } else {
      return JSON.stringify(data);
    }
  }

}
