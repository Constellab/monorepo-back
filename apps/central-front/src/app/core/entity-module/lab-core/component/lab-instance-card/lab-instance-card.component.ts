import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabInstance} from '../../../../model/entities/lab-instance.class';
import {RouterService} from '../../../../service/router.service';
import {StatusChipMode} from '../../../../module/status/status-chip/status-chip.component';

/**
 * Card to display a {@link LabInstance}
 */
@Component({
  selector: 'gen-lab-instance-card',
  templateUrl: './lab-instance-card.component.html',
  styleUrls: ['./lab-instance-card.component.scss']
})
export class LabInstanceCardComponent implements OnInit {

  @Input() labInstance: LabInstance;

  @Input() mode: 'small' | 'big' = 'small';

  @Output() labInstanceUpdated: EventEmitter<LabInstance> = new EventEmitter<LabInstance>();

  labInstanceRoute: string;
  labIframeRoute: string;

  isLoading: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.labInstanceRoute = RouterService.getLabInstanceDetailRoute(this.labInstance.id);
    this.labIframeRoute = RouterService.getLabIframeRoute(this.labInstance.id);

  }

  onLabUpdate(lab: LabInstance): void {
    this.labInstance = lab;
    this.labInstanceUpdated.emit(lab);
  }

  get statusChipMode(): StatusChipMode {
    return this.mode === 'small' ? 'iconOnly' : 'iconText';
  }

}
