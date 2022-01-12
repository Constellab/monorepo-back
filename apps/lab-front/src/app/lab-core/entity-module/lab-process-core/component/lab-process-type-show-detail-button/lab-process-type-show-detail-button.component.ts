import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FlOverlayRef, FlPortalService} from '@monorepo/front-core-lib';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {LabProcessTypePortalComponent} from '../lab-process-type-portal/lab-process-type-portal.component';

/**
 * Icon button to load and show process type detail in a portal on clic
 */
@Component({
  selector: 'lab-process-type-show-detail-button',
  templateUrl: './lab-process-type-show-detail-button.component.html',
  styleUrls: ['./lab-process-type-show-detail-button.component.scss']
})
export class LabProcessTypeShowDetailButtonComponent implements OnInit, OnDestroy {

  @Input() processTypingName: string;

  private detailSubscription: Subscription;
  private detailOverlay: FlOverlayRef;


  constructor(private typeService: LabTypeService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
  }


  showDetail(event: MouseEvent): void {
    this.clearDetail();

    this.typeService.getTyping(this.processTypingName).subscribe(
      processType => this.openPortalDetail(processType, event.target as any)
    );
  }

  private openPortalDetail(processType: LabProcessType, element: Element): void {
    const config = this.portalService.configureRelativePortal(element, ['left', 'bottom', 'right', 'top'], {
      elevation: true,
      disposeOnOutsideClick: true,
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
