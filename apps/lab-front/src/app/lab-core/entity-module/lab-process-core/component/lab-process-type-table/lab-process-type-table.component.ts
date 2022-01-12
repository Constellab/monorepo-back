import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FlOverlayRef, FlPortalService, FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabTypeEntity, LabTypeEntityDatasource} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {ClHelpService} from '@monorepo/core-lib';
import {LabProcessTypePortalComponent} from '../lab-process-type-portal/lab-process-type-portal.component';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lab-process-type-table',
  templateUrl: './lab-process-type-table.component.html',
  styleUrls: ['./lab-process-type-table.component.scss']
})
export class LabProcessTypeTableComponent extends FlTableAbstractDirective<LabTypeEntity>
  implements OnInit, OnDestroy {

  @Input() datasource: LabTypeEntityDatasource;

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() typeSelected: EventEmitter<LabTypeEntity> = new EventEmitter<LabTypeEntity>();

  private detailSubscription: Subscription;
  private detailOverlay: FlOverlayRef;

  constructor(private typeService: LabTypeService,
              private portalService: FlPortalService) {
    super(['detail']);
  }

  ngOnInit(): void {
  }

  rowClicked(type: LabTypeEntity): void {
    if (this.rowSelectable) {
      this.typeSelected.next(type);
    }
  }

  showDetail(type: LabTypeEntity, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.clearDetail();

    this.typeService.getTyping(type.typingName).subscribe(
      processType => this.openPortalDetail(processType, event.target as any)
    );
  }

  private openPortalDetail(processType: LabProcessType, element: Element): void {
    const config = this.portalService.configureRelativePortal(element, ['left', 'bottom'], {
      elevation: true,
      disposeOnOutsideClick: true
    });

    this.detailOverlay = this.portalService.createPortal(LabProcessTypePortalComponent, config, processType);
  }

  private clearDetail(): void {
    this.detailSubscription?.unsubscribe();
    this.detailOverlay?.dispose();
  }

  ngOnDestroy(): void {
    this.clearDetail();
  }


}
