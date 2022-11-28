import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaLabInstance} from '../../../../model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {ClHelpService} from '@monorepo/core-lib';
import {FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Toggle button to start or stop the lab instance
 */
@Component({
  selector: 'ca-lab-instance-start-stop',
  templateUrl: './ca-lab-instance-start-stop.component.html',
  styleUrls: ['./ca-lab-instance-start-stop.component.scss']
})
export class CaLabInstanceStartStopComponent implements OnInit {

  @Input() labInstance: CaLabInstance;
  @Output() update: EventEmitter<CaLabInstance> = new EventEmitter<CaLabInstance>();

  isLoading: boolean = false;

  constructor(private labInstanceService: CaLabInstanceService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
  }

  startLab(event: Event): void {
    ClHelpService.stopEventPropagation(event);

    this.isLoading = true;
    this.labInstanceService.startLabInstance(this.labInstance.id).subscribe(
      lab => this.onLabUpdate(lab, 'lab_started'),
      () => this.isLoading = false
    );
  }

  stopLab(event: Event): void {
    ClHelpService.stopEventPropagation(event);

    this.isLoading = true;
    this.labInstanceService.stopLabInstance(this.labInstance.id).subscribe(
      lab => this.onLabUpdate(lab, 'lab_stopped'),
      () => this.isLoading = false
    );
  }

  private onLabUpdate(lab: CaLabInstance, successTest: string): void {
    this.snackBarService.openSuccessMessage({text: successTest, translateText: true});
    this.update.emit(lab);
    this.isLoading = false;
  }

  // prevent ripple effect when used on card
  stopEventPropagation(event: Event): void {
    event.stopPropagation();
  }

}
