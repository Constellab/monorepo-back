import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {LabFlaggedEntity} from '../../../../model/global/lab-flagged-entity.class';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';

/**
 * Button to toggle the flag of an element.
 */
@Component({
  selector: 'lab-flag-button',
  templateUrl: './lab-flag-button.component.html',
  styleUrls: ['./lab-flag-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabFlagButtonComponent implements OnInit {

  @Input() entity: LabFlaggedEntity;

  private isLoading: boolean = false;

  constructor(private viewConfigService: LabViewConfigService,
              private resourceService: LabResourceService) {
  }

  ngOnInit(): void {
  }

  toggleHighlight(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);

    if (this.isLoading) return;

    this.entity.flagged = !this.entity.flagged;
    if (this.entity instanceof LabViewConfig) {
      this.isLoading = true;
      this.viewConfigService.updateFlagged(this.entity.id, this.entity.flagged).subscribe({
        next: () => this.onSuccess(),
        error: () => this.onError(this.entity.flagged)
      });
    } else if (this.entity instanceof LabResource) {
      this.isLoading = true;
      this.resourceService.updateFlagged(this.entity.id, this.entity.flagged).subscribe({
        next: () => this.onSuccess(),
        error: () => this.onError(this.entity.flagged)
      });
    } else {
      console.error('[LabHighlightButtonComponent] type is not supported');
    }
  }

  private onSuccess(): void {
    this.isLoading = false;
  }

  private onError(highlighted: boolean): void {
    this.entity.flagged = !highlighted;
    this.isLoading = false;
  }


  get fontSet(): string {
    return this.entity.flagged ? 'material-icons' : 'material-icons-outlined';
  }

  get tooltip(): string {
    if (this.entity instanceof LabViewConfig) {
      return this.entity.flagged ? 'biox.view_flagged_tooltip' : 'biox.view_not_flagged_tooltip';
    } else if (this.entity instanceof LabResource) {
      return this.entity.flagged ? 'biox.resource_flagged_tooltip' : 'biox.resource_not_flagged_tooltip';
    } else {
      console.error('[LabFlagButtonComponent] Object type unknown');
      return '';
    }
  }

}
