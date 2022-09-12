import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlDropEvent, FlTableAbstractDirective, FlTag, FlTagSelectedEvent} from '@monorepo/front-core-lib';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabDragType} from '../../../../model/global/lab-drag-type.class';
import {LabExperimentService} from '../../../../entity-service/lab-experiment.service';

@Component({
  selector: 'lab-experiment-table',
  templateUrl: './lab-experiment-table.component.html',
  styleUrls: ['./lab-experiment-table.component.scss']
})
export class LabExperimentTableComponent extends FlTableAbstractDirective<LabExperiment>
  implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() experimentSelected: EventEmitter<LabExperiment> = new EventEmitter();

  @Output() tagSelected: EventEmitter<FlTag> = new EventEmitter();

  @Output() experimentDisassociate: EventEmitter<LabExperiment> = new EventEmitter();


  // enable drop tags
  supportedDropType: LabDragType = LabDragType.TAG;

  constructor(private experimentService: LabExperimentService) {
    super(['title', 'score', 'status', 'createdAt', 'tags', 'disassociate']);
  }

  ngOnInit(): void {
  }

  rowClicked(experiment: LabExperiment): void {
    if (this.rowSelectable) {
      this.experimentSelected.next(experiment);
    }
  }

  onTagSelected(tagEvent: FlTagSelectedEvent): void {
    ClHelpService.stopEventPropagation(tagEvent.event);
    this.tagSelected.next(tagEvent.tag);
  }

  onDrop(experiment: LabExperiment, event: FlDropEvent<FlTag>): void {
    if (!event.data) return;

    experiment.addTag(event.data);
    this.experimentService.saveTags(experiment.id, experiment.tags).subscribe();
  }

  disassociateExperiment(experiment: LabExperiment, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.experimentDisassociate.next(experiment);
  }
}
