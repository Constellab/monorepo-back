import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaLabInstance} from '../../../../model/entities/ca-lab-instance.class';
import {CaRouterService} from '../../../../service/ca-router.service';
import {FlStatusChipMode} from '@monorepo/front-core-lib';

/**
 * Card to display a {@link CaLabInstance}
 */
@Component({
  selector: 'ca-lab-instance-card',
  templateUrl: './ca-lab-instance-card.component.html',
  styleUrls: ['./ca-lab-instance-card.component.scss']
})
export class CaLabInstanceCardComponent implements OnInit {

  @Input() labInstance: CaLabInstance;

  @Input() mode: 'small' | 'big' = 'small';

  @Output() labInstanceUpdated: EventEmitter<CaLabInstance> = new EventEmitter<CaLabInstance>();

  labIframeRoute: string;

  isLoading: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.labIframeRoute = CaRouterService.getLabIframeRoute(this.labInstance.id);

  }

  onLabUpdate(lab: CaLabInstance): void {
    this.labInstance = lab;
    this.labInstanceUpdated.emit(lab);
  }

  get statusChipMode(): FlStatusChipMode {
    return this.mode === 'small' ? 'iconOnly' : 'iconText';
  }

}
