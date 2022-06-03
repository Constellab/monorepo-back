import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabResourceDetailTabsState, LabResourceTab} from '../../state/lab-resource-detail-tabs-state';

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

  selectedTabIndex: number = 0;

  resourceWithViews: LabResourceTab[];

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
      resourceWithViews => this.onNewResourceWithView(resourceWithViews)
    );
  }

  private onNewResourceId(id: string): void {
    this.state.init(id);
  }

  private onNewResourceWithView(resourceWithViews: LabResourceTab[]): void {
    // select th last tab only if a view was added
    if (this.resourceWithViews && resourceWithViews.length > this.resourceWithViews.length) {
      this.selectedTabIndex = resourceWithViews.length - 1;
    }
    this.resourceWithViews = resourceWithViews;
  }

}
