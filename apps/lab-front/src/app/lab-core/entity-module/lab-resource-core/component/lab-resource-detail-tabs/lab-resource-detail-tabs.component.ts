import {Component, Input, OnInit, TrackByFunction} from '@angular/core';
import {Observable} from 'rxjs';
import {LabResourceDetailTabsState, LabResourceTab} from '../../state/lab-resource-detail-tabs-state.service';

/**
 * Component to show a resource detail with tabs to show other resources or views
 */
@Component({
  selector: 'lab-resource-detail-tabs',
  templateUrl: './lab-resource-detail-tabs.component.html',
  styleUrls: ['./lab-resource-detail-tabs.component.scss'],
  providers: [LabResourceDetailTabsState]
})
export class LabResourceDetailTabsComponent implements OnInit {

  @Input() resourceId: string | Observable<string>;

  // when true, the transform, import button are deactivate
  @Input() readOnly: boolean = false;

  tabs: LabResourceTab[];
  selectedTabIndex: number = 0;

  trackByViewSymbol: TrackByFunction<LabResourceTab> =
    (_, resourceTab: LabResourceTab) => resourceTab.viewSymbol;

  constructor(private state: LabResourceDetailTabsState) {
  }

  ngOnInit(): void {
    if (this.resourceId instanceof Observable) {
      this.resourceId.subscribe(
        id => this.onNewResourceId(id)
      );
    } else {
      this.onNewResourceId(this.resourceId);
    }

    this.state.getTabs$().subscribe(
      tabs => this.onNewTabs(tabs)
    );
  }

  private onNewResourceId(id: string): void {
    this.state.init(id);
  }

  private onNewTabs(tabs: LabResourceTab[]): void {
    // select th last tab only if a view was added
    if (this.tabs && tabs.length > this.tabs.length) {
      this.selectedTabIndex = tabs.length - 1;
    }
    this.tabs = tabs;
  }


}
