import {Component, EventEmitter, OnInit, Optional, Output, Self} from '@angular/core';
import {FlDialogService, FlFormFieldDirective} from '@monorepo/front-core-lib';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';
import {NgControl} from '@angular/forms';
import {LabExperimentService} from '../../../../entity-service/lab-experiment.service';
import {Subscription} from 'rxjs';
import {
  LabSelectExperimentDialogComponent
} from '../lab-select-experiment-dialog/lab-select-experiment-dialog.component';

@Component({
  selector: 'lab-select-experiment',
  templateUrl: './lab-select-experiment.component.html',
  styleUrls: ['./lab-select-experiment.component.scss'],
  providers: [{provide: FlFormFieldDirective, useExisting: LabSelectExperimentComponent}]
})
export class LabSelectExperimentComponent extends FlFormFieldDirective<LabExperiment, Partial<LabExperiment>>
  implements OnInit {

  @Output() experimentChange: EventEmitter<LabExperiment> = new EventEmitter();

  isLoading: boolean = false;

  private subscription: Subscription;


  constructor(@Optional() @Self() ngControl: NgControl,
              private experimentService: LabExperimentService,
              private dialogService: FlDialogService) {
    super(ngControl);
  }

  ngOnInit(): void {
  }


  writeValue(obj: Partial<LabExperiment>): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.isLoading = false;

    if (obj == null || obj.id == null) {
      this.value = null;
      return;
    }

    // if the id didn't change, do nothing
    if (this.value?.id === obj.id) return;

    this.value = obj as LabExperiment;

    // if the provided object is not an instance of LabExperiment, load it from the api
    if (!(obj instanceof LabExperiment)) {
      this.loadExperiment(obj.id);
    }
  }

  private loadExperiment(id: string): void {
    this.isLoading = true;
    this.subscription = this.experimentService.getExperiment(id).subscribe(
      {
        next: experiment => this.onExperimentLoaded(experiment),
        error: () => this.isLoading = false
      }
    );
  }

  private onExperimentLoaded(experiment: LabExperiment): void {
    // check if this is still the selected experiment
    if (this.value?.id === experiment.id) {
      this.setAndEmitValue(experiment);
    }
    this.isLoading = false;
  }

  callChangeEvent(value: Partial<LabExperiment>): void {
    this.experimentChange.next(value as LabExperiment);
  }

  onDisableChange(): void {
  }

  openExperimentSelection(): void {
    this.dialogService.openBigDialog(LabSelectExperimentDialogComponent).afterClosed().subscribe(
      experiment => this.selectExperimentClosed(experiment)
    );
  }

  private selectExperimentClosed(experiment?: LabExperiment): void {
    if (experiment) {
      this.setAndEmitValue(experiment);
    }
  }

}
