import {Component, Input, OnInit} from '@angular/core';
import {LabResourceDetailTabsState} from '../../state/lab-resource-detail-tabs-state';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

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

  view: LabResourceView;

  isLoading: boolean = true;
  isError: boolean = false;

  showCloseButton$: Observable<boolean>;

  constructor(private state: LabResourceDetailTabsState) {
  }

  ngOnInit(): void {
    this.state.getView$(this.viewSymbol).subscribe({
      next: view => this.onSuccess(view),
      error: () => this.onError()
    });

    this.showCloseButton$ = this.state.getTabs$().pipe(
      map(resourceWithViews => resourceWithViews.length > 1)
    );
  }

  private onSuccess(view: LabResourceView): void {
    this.view = view;
    this.isLoading = false;
  }

  private onError(): void {
    this.isError = true;
    this.isLoading = false;
  }

  closeTab(): void {
    this.state.closeTab(this.viewSymbol);
  }

}
