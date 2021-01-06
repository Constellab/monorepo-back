import {Directive} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormDialogInput} from '../model/global/form.class';
import {SnackBarService} from '../service/snack-bar.service';
import {FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';

/**
 * Abstract directive to structure form dialog component that support create and update mode
 *
 * The init method must be called in ngOnInit
 *
 * FORM_TYPE: type of the form
 * ENTITY: type of the entity returned by the create and update method
 */
@Directive()
export abstract class FormDialogAbstractDirective<FORM_TYPE, ENTITY = FORM_TYPE> {

  formGp: FormGroup<FORM_TYPE>;

  isLoading: boolean = false;

  protected constructor(protected dialogInput: FormDialogInput<FORM_TYPE>,
                        protected snackBarService: SnackBarService,
                        protected dialogRef: MatDialogRef<any>,
                        private createSuccessMessage: string,
                        private updateSuccessMessage: string) {
  }

  abstract buildForm(): FormGroup<FORM_TYPE>;

  abstract create(formValue: FORM_TYPE): Observable<ENTITY>;

  abstract update(formValue: FORM_TYPE): Observable<ENTITY>;


  /**
   * Must call this method on init
   */
  init(): void {
    this.formGp = this.buildForm();
    if (this.dialogInput.mode === 'update') {
      this.patchUpdate();
    }
  }

  protected patchUpdate(): void {
    this.formGp.patchValue(this.dialogInput.object);
  }


  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.isLoading = true;

      const formValue: FORM_TYPE = this.formGp.getRawValue();

      if (this.dialogInput.mode === 'create') {
        this.callCreate(formValue);
      } else {
        this.callUpdate(formValue);
      }
    }
  }

  private callCreate(formValue: FORM_TYPE): void {
    this.create(formValue).subscribe(
      newEntity => this.onSaveSuccess(newEntity, this.createSuccessMessage),
      () => this.isLoading = false
    );
  }

  private callUpdate(formValue: FORM_TYPE): void {
    this.update(formValue).subscribe(
      newEntity => this.onSaveSuccess(newEntity, this.updateSuccessMessage),
      () => this.isLoading = false
    );
  }

  protected onSaveSuccess(entity: ENTITY, successText: string): void {
    this.snackBarService.openSuccessMessage(successText, true);

    this.dialogRef.close(entity);
    this.isLoading = false;
  }

  protected isCreateMode(): boolean {
    return this.dialogInput.mode === 'create';
  }

  protected isUpdateMode(): boolean {
    return this.dialogInput.mode === 'update';
  }

}
