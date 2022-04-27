import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FlInfiniteScrollMode} from '@monorepo/front-core-lib';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {Observable} from 'rxjs';
import {RvResourceViewDirective, RvResourceViewText} from '@monorepo/resource-view';


// Spec name of the page on view text
const labResourceViewTextSpecPage: string = 'page';

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
export class LabResourceTextComponent extends RvResourceViewDirective<RvResourceViewText> implements OnInit {

  @Input() view: RvResourceViewText;

  @Input() infiniteScrollMode: FlInfiniteScrollMode = 'body';

  text: string = '';

  private lowerPage: number = 1; // for loading previous page
  private higherPage: number = 1; // for loading next page

  reachedFirstPage: boolean = false;
  reachedLastPage: boolean = false;

  isLoading: boolean = false;

  constructor(private resourceService: LabResourceService,
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
    this.callPagination(this.higherPage).subscribe({
      next: view => this.loadNextPageSuccess(view),
      error: () => this.isLoading = false
    });
  }

  private loadNextPageSuccess(view: RvResourceViewText): void {
    this.view.data.text += this.toString(view.data.text);
    this.text += this.toString(view.data.text);
    this.reachedLastPage = view.data.is_last_page;
    this.onSuccess();
  }

  loadPreviousPage(): void {
    this.isLoading = true;
    this.lowerPage--;
    this.callPagination(this.lowerPage).subscribe({
      next: view => this.loadPreviousPageSuccess(view),
      error: () => this.isLoading = false
    });
  }

  private callPagination(page: number): Observable<RvResourceViewText> {
    // merge config with pagination config
    const viewConfig = Object.assign(this.config.configValues, {[labResourceViewTextSpecPage]: page});

    return this.resourceService.callResourceView(this.resourceId, this.config.methodName,
      viewConfig,
      this.config.transformers) as Observable<RvResourceViewText>;
  }

  private loadPreviousPageSuccess(view: RvResourceViewText): void {
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
