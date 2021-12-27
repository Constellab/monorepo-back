import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FlInfiniteScrollMode} from '@monorepo/front-core-lib';
import {LabResourceViewDirective} from '../../model/lab-resource-view-component.class';
import {
  LabResourceViewText,
  labResourceViewTextSpecPage
} from '../../../../model/entities/resource/lab-resource-view.entity';
import {
  LabResourceDetailPageState
} from '../../../../../lab-databox/module/lab-resource-detail-page/state/lab-resource-detail-page.state';

/**
 * Component to view a resource as plain text
 *
 * Support pagination to previous or next page
 */
@Component({
  selector: 'lab-resource-text',
  templateUrl: './lab-resource-text.component.html',
  styleUrls: ['./lab-resource-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabResourceTextComponent extends LabResourceViewDirective<LabResourceViewText> implements OnInit {

  @Input() view: LabResourceViewText;

  @Input() infiniteScrollMode: FlInfiniteScrollMode = 'body';

  text: string = '';

  private lowerPage: number = 1; // for loading previous page
  private higherPage: number = 1; // for loading next page

  reachedFirstPage: boolean = false;
  reachedLastPage: boolean = false;

  isLoading: boolean = false;

  constructor(private state: LabResourceDetailPageState,
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
    const paginationConfig = {[labResourceViewTextSpecPage]: this.higherPage};
    this.state.callPagination(paginationConfig).subscribe(
      view => this.loadNextPageSuccess(view as any),
      () => this.isLoading = false
    );
  }

  private loadNextPageSuccess(view: LabResourceViewText): void {
    this.view.data.text += this.toString(view.data.text);
    this.text += this.toString(view.data.text);
    this.reachedLastPage = view.data.is_last_page;
    this.onSuccess();
  }

  loadPreviousPage(): void {
    this.isLoading = true;
    this.lowerPage--;
    const paginationConfig = {[labResourceViewTextSpecPage]: this.lowerPage};
    this.state.callPagination(paginationConfig).subscribe(
      view => this.loadPreviousPageSuccess(view as any),
      () => this.isLoading = false
    );
  }

  private loadPreviousPageSuccess(view: LabResourceViewText): void {
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
