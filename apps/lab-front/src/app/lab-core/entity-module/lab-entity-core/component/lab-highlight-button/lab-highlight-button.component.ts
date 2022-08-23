import {Component, Input, OnInit} from '@angular/core';
import {LabHighlightedEntity} from '../../../../model/global/lab-highlighted-entity.class';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Button to toggle the highlight of an element.
 */
@Component({
  selector: 'lab-highlight-button',
  templateUrl: './lab-highlight-button.component.html',
  styleUrls: ['./lab-highlight-button.component.scss']
})
export class LabHighlightButtonComponent implements OnInit {

  @Input() entity: LabHighlightedEntity;

  private isLoading: boolean = false;

  constructor(private viewConfigService: LabViewConfigService) {
  }

  ngOnInit(): void {
  }

  toggleHighlight(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);

    if (this.isLoading) return;

    this.entity.highlighted = !this.entity.highlighted;
    if (this.entity instanceof LabViewConfig) {
      this.isLoading = true;
      this.viewConfigService.updateHighlighted(this.entity.id, this.entity.highlighted).subscribe({
        next: () => this.onSuccess(),
        error: () => this.onError(this.entity.highlighted)
      });
    } else {
      console.error('[LabHighlightButtonComponent] type is not supported');
    }
  }

  private onSuccess(): void {
    this.isLoading = false;
  }

  private onError(highlighted: boolean): void {
    this.entity.highlighted = !highlighted;
    this.isLoading = false;
  }

  get icon(): string {
    return this.entity.highlighted ? 'star' : 'star_outline';
  }

  get tooltip(): string{
    return this.entity.highlighted ? 'biox.highlighted_tooltip': 'biox.not_highlighted_tooltip'
  }

}
