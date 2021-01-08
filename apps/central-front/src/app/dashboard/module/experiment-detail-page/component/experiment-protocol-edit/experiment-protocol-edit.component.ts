import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {newProtocolFormGp, Protocol} from '../../../../../core/model/entities/protocol.entity';
import {Experiment} from '../../../../../core/model/entities/experiment.class';
import {ExperimentService} from '../../../../service/experiment.service';
import {FormGroup} from '@ngneat/reactive-forms';
import {MatSelectChange} from '@angular/material/select';
import {Subscription} from 'rxjs';
import {SelectProtocolOptionsComponent} from '../../../../../core/entity-module/protocol-core/component/select-protocol-options/select-protocol-options.component';
import {FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Form to update the protocol of a experiment
 */
@Component({
  selector: 'gen-experiment-protocol-edit',
  templateUrl: './experiment-protocol-edit.component.html',
  styleUrls: ['./experiment-protocol-edit.component.scss']
})
export class ExperimentProtocolEditComponent implements OnInit, OnDestroy {

  @Input() experimentId: string;

  @Input() protocol: Protocol;

  @Output() protocolUpdate: EventEmitter<Experiment> = new EventEmitter<Experiment>();

  @ViewChild(SelectProtocolOptionsComponent) private protocolSelectOptions: SelectProtocolOptionsComponent;

  formGp: FormGroup<Partial<Protocol>>;

  // selected protocol from mat-select
  selectedProtocol: Protocol;

  // true if the formGp value equal the selectedProtocol
  currentProtocolEqualSelected: boolean = true;

  subscription: Subscription;

  isLoading: boolean = false;

  constructor(private experimentService: ExperimentService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.initForm();

    this.subscription = this.formGp.valueChanges.subscribe(
      value => this.onFormGpValueChanges(value)
    );
  }

  private initForm(): void {
    this.formGp = newProtocolFormGp();

    if (this.protocol) {
      this.formGp.patchValue(this.protocol);
      this.selectedProtocol = this.protocol;
    }
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      const protocol: Partial<Protocol> = this.formGp.getRawValue();

      // if the protocol is different, remove the id before returning the protocol
      // to create a new protocol
      if (!this.currentProtocolEqualSelected) {
        delete protocol.id;
      }

      this.updateProtocol(protocol);
    } else {
      // mark the protocolFormGp as touched
      this.formGp.markAllAsTouched();
    }
  }

  private updateProtocol(protocol: Partial<Protocol>): void {
    this.isLoading = true;
    this.experimentService.updateProtocol(this.experimentId, protocol).subscribe(
      experiment => this.updateSuccess(experiment),
      () => this.isLoading = false
    );
  }

  private updateSuccess(experiment: Experiment): void {
    this.snackBarService.openSuccessMessage('protocol_updated', true);
    this.isLoading = false;
    this.protocolUpdate.emit(experiment);

    // select the experiment protocol
    this.selectedProtocol = experiment.protocol;
    // refresh the select options
    this.protocolSelectOptions.refreshOptions();
  }

  private onFormGpValueChanges(value: Partial<Protocol>): void {
    this.currentProtocolEqualSelected = this.checkFormGpValueEqualSelectedProtocol(value);
  }

  // return true if the value is the same protocol as the selectedProtocol
  private checkFormGpValueEqualSelectedProtocol(value: Partial<Protocol>): boolean {
    return value.id && this.selectedProtocol && this.selectedProtocol.label === value.label &&
      this.selectedProtocol.json === value.json;
  }

  onProtocolSelection(event: MatSelectChange): void {
    this.formGp.patchValue(event.value);
  }

  get selectMatHintText(): string {
    return this.currentProtocolEqualSelected ? 'protocol_input_help_same' : 'protocol_input_help_another';
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
