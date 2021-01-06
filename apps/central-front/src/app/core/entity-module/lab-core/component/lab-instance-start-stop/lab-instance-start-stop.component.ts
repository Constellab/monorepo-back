import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabInstance} from '../../../../model/entities/lab-instance.class';
import {HelpService} from '../../../../utils/help-service';
import {LabInstanceService} from '../../../../service-api/lab-instance.service';
import {SnackBarService} from '../../../../service/snack-bar.service';

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
              private snackBarService: SnackBarService) {
  }

  ngOnInit(): void {
  }

  startLab(event: Event): void {
    HelpService.stopEventPropagation(event);

    this.isLoading = true;
    this.labInstanceService.startLabInstance(this.labInstance.id).subscribe(
      lab => this.onLabUpdate(lab, 'lab_started'),
      () => this.isLoading = false
    );
  }

  stopLab(event: Event): void {
    HelpService.stopEventPropagation(event);

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
