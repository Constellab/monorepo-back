import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {newProtocolFormGp, Protocol} from '../../../../model/entities/protocol.entity';
import {ProtocolService} from '../../../../service-api/protocol.service';
import {SnackBarService} from '../../../../service/snack-bar.service';
import {MatDialogRef} from '@angular/material/dialog';

/**
 * Form dialog to create a protocol
 */
@Component({
  selector: 'gen-protocol-form-dialog',
  templateUrl: './protocol-form-dialog.component.html',
  styleUrls: ['./protocol-form-dialog.component.scss']
})
export class ProtocolFormDialogComponent implements OnInit {

  formGp: FormGroup<Partial<Protocol>>;

  isLoading: boolean = false;

  constructor(private protocolService: ProtocolService,
              private snackBarService: SnackBarService,
              private dialogRef: MatDialogRef<ProtocolFormDialogComponent>) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formGp = newProtocolFormGp();

  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.isLoading = true;

      const protocol: Partial<Protocol> = this.formGp.getRawValue();

      this.createProtocol(protocol);
    } else {
      // mark the protocolFormGp as touched
      this.formGp.markAllAsTouched();
    }
  }

  private createProtocol(protocol: Partial<Protocol>): void {
    this.protocolService.create(protocol).subscribe(
      newProtocol => this.onSaveSuccess(newProtocol, 'new_protocol'),
      () => this.isLoading = false
    );
  }


  private onSaveSuccess(experiment: Protocol, successText: string): void {
    this.snackBarService.openSuccessMessage(successText, true);

    this.dialogRef.close(experiment);
  }

}
