import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabInstance} from '../../../../model/entities/lab-instance.class';
import {LabInstanceService} from '../../../../service-api/lab-instance.service';
import {ClHelpService} from '@monorepo/core-lib';
import {FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Toggle button to start or stop the lab instance
 */
@Component({
  selector: 'gen-lab-instance-start-stop',
  templateUrl: './lab-instance-start-stop.component.html',
  styleUrls: ['./lab-instance-start-stop.component.scss']
})
export class LabInstanceStartStopComponent implements OnInit {

  @Input() labInstance: LabInstance;
  @Output() update: EventEmitter<LabInstance> = new EventEmitter<LabInstance>();

  isLoading: boolean = false;

  constructor(private labInstanceService: LabInstanceService,
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

  private onLabUpdate(lab: LabInstance, successTest: string): void {
    this.snackBarService.openSuccessMessage(successTest, true);
    this.update.emit(lab);
    this.isLoading = false;
  }

}
