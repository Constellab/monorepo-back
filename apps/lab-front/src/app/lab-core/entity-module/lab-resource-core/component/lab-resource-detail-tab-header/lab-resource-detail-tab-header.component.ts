import {Component, Input, OnInit} from '@angular/core';
import {LabResourceDetailTabsState} from '../../state/lab-resource-detail-tabs-state';
import {LabResourceViewData} from '../../../../model/entities/resource/lab-resource-view.entity';
import {firstValueFrom, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FlMouseButton} from '@monorepo/front-core-lib';

/**
 * Header of the tab of a resource with view, its also show a loading indicator while the view is loading
 */
@Component({
  selector: 'lab-resource-detail-tab-header',
  templateUrl: './lab-resource-detail-tab-header.component.html',
  styleUrls: ['./lab-resource-detail-tab-header.component.scss']
})
export class LabResourceDetailTabHeaderComponent implements OnInit {

  @Input() viewSymbol: symbol;

  view: LabResourceViewData;

  isLoading: boolean = true;
  isError: boolean = false;

  showCloseButton$: Observable<boolean>;

  constructor(private state: LabResourceDetailTabsState) {
  }

  ngOnInit(): void {
    this.state.getView$(this.viewSymbol).subscribe({
      next: view => this.onSuccess(view.view),
      error: () => this.onError()
    });

    this.showCloseButton$ = this.state.getTabs$().pipe(
      map(resourceWithViews => resourceWithViews.length > 1)
    );
  }

  private onSuccess(view: LabResourceViewData): void {
    this.view = view;
    this.isLoading = false;
  }

  private onError(): void {
    this.isError = true;
    this.isLoading = false;
  }

  async onTabClick(event: MouseEvent): Promise<void> {
    const showCloseButton = await firstValueFrom(this.showCloseButton$);
    if (showCloseButton && event.button === FlMouseButton.MIDDLE) {
      this.closeTab();
    }
  }

  closeTab(): void {
    this.state.closeTab(this.viewSymbol);
  }

}
