import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  LabResourceDetailState,
  LabResourceViewEvent
} from '../../../../../lab-databox/module/lab-resource-detail-page/state/lab-resource-detail-state.service';
import {LabResourceView, LabResourceViewConfig} from '../../../../model/entities/resource/lab-resource-view.entity';
import {Subscription} from 'rxjs';


interface LabViewWithConfig {
  view: LabResourceView;
  viewConfig: LabResourceViewConfig;
}


@Component({
  selector: 'lab-resource-detail-view-tabs',
  templateUrl: './lab-resource-detail-view-tabs.component.html',
  styleUrls: ['./lab-resource-detail-view-tabs.component.scss']
})
export class LabResourceDetailViewTabsComponent implements OnInit, OnDestroy {

  selectedTabIndex: number = 0;
  resourceId: string;

  views: LabViewWithConfig[] = [];

  showLoader: boolean = true;

  private subscription: Subscription;


  constructor(private state: LabResourceDetailState) {
  }

  ngOnInit(): void {
    this.resourceId = this.state.id;

    // subscribe to fullscreen view
    this.subscription = this.state.getView$().subscribe(
      view => this.showFullScreenView(view)
    );
  }

  private showFullScreenView(viewEvent: LabResourceViewEvent): void {
    this.showLoader = false;

    if (viewEvent.viewEvent && viewEvent.viewEvent.displayMode === 'fullScreen') {
      this.views.push({
        view: viewEvent.viewEvent.view,
        viewConfig: viewEvent.viewEvent.viewConfig
      });

      this.selectedTabIndex = this.views.length - 1;
    }
  }

  closeTab(index: number): void {
    this.views.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
