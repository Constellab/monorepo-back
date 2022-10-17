import {Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {CaProjectDetailRightPanel, CaProjectDetailState} from '../../state/ca-project-detail.state';
import {CaProjectDescriptionComponent} from '../ca-project-description/ca-project-description.component';
import {CaProjectReportPreviewComponent} from '../ca-project-report-preview/ca-project-report-preview.component';
import {
  CaProjectExperimentPreviewComponent
} from '../ca-project-experiment-preview/ca-project-experiment-preview.component';

/**
 * Right panel of the project detail page
 */
@Component({
  selector: 'ca-project-detail-right-panel',
  templateUrl: './ca-project-detail-right-panel.component.html',
  styleUrls: ['./ca-project-detail-right-panel.component.scss']
})
export class CaProjectDetailRightPanelComponent implements OnInit, OnDestroy {

  @ViewChild('container', {static: true, read: ViewContainerRef}) container: ViewContainerRef;

  private viewComponentRef: ComponentRef<any>;

  constructor(private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.state.getRightPanelState$().subscribe(
      state => this.createComponent(state)
    );
  }

  private createComponent(rightPanelState: CaProjectDetailRightPanel): void {
    this.destroyViewComponentRef();

    switch (rightPanelState.type) {
      case 'description':
        this.viewComponentRef = this.container.createComponent(CaProjectDescriptionComponent);
        break;
      case 'report':
        this.viewComponentRef = this.container.createComponent(CaProjectReportPreviewComponent);
        break;
      case 'experiment':
        this.viewComponentRef = this.container.createComponent(CaProjectExperimentPreviewComponent);
        break;
      default:
        console.log('Unknown right panel type', rightPanelState.type);
    }
  }

  private destroyViewComponentRef(): void {
    this.viewComponentRef?.destroy();
    this.viewComponentRef = null;
  }

  ngOnDestroy(): void {
    this.destroyViewComponentRef();
  }


}
