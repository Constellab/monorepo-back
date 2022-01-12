import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabTypeEntity, LabTypeEntityDatasource} from '../../../../model/entities/lab-type/lab-type.entity';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'lab-process-type-table',
  templateUrl: './lab-process-type-table.component.html',
  styleUrls: ['./lab-process-type-table.component.scss']
})
export class LabProcessTypeTableComponent extends FlTableAbstractDirective<LabTypeEntity>
  implements OnInit {

  @Input() datasource: LabTypeEntityDatasource;

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() typeSelected: EventEmitter<LabTypeEntity> = new EventEmitter<LabTypeEntity>();

  constructor() {
    super(['detail']);
  }

  ngOnInit(): void {
  }

  rowClicked(type: LabTypeEntity): void {
    if (this.rowSelectable) {
      this.typeSelected.next(type);
    }
  }

  stopEventPropagation(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
  }


}
