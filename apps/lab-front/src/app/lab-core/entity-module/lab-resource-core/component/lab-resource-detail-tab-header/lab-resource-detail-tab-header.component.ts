import {Component, Input, OnInit} from '@angular/core';
import {LabResourceDetailTabsState, LabResourceTab} from '../../state/lab-resource-detail-tabs-state.service';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FlMouseButton} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';

@Component({
  selector: 'lab-resource-detail-tab-header',
  templateUrl: './lab-resource-detail-tab-header.component.html',
  styleUrls: ['./lab-resource-detail-tab-header.component.scss']
})
export class LabResourceDetailTabHeaderComponent implements OnInit {

  @Input() tab: LabResourceTab;
  @Input() showCloseButton: boolean = false;

  title: string;
  icon: string;
  isLoading: boolean = true;
  isError: boolean = false;

  constructor(private state: LabResourceDetailTabsState) {
  }


  ngOnInit(): void {
    if (this.tab.type === 'resource') {
      this.tab.obs.subscribe({
        next: resource => this.onResourceSuccess(resource),
        error: () => this.onError()
      });
    } else {
      this.tab.obs.subscribe({
        next: view => this.onViewSuccess(view),
        error: () => this.onError()
      });
    }
  }

  private onResourceSuccess(resource: LabResource): void {
    this.title = resource.name;
    this.icon = 'resource';
    this.isLoading = false;
  }

  private onViewSuccess(view: LabResourceView): void {
    this.title = view.viewConfig.title;
    this.icon = 'view';
    this.isLoading = false;
  }

  private onError(): void {
    this.isError = true;
    this.isLoading = false;
  }

  async onTabClick(event: MouseEvent): Promise<void> {
    if (this.showCloseButton && event.button === FlMouseButton.MIDDLE) {
      this.closeTab();
    }
  }

  closeTab(): void {
    this.state.closeTab(this.tab.viewSymbol);
  }

}
