import {Directive} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {FlSnackBarService} from '../../module/fl-snack-bar/fl-snack-bar.service';
import {FlFormDialogInput} from '../../model/fl-form.class';
import {FormGroup} from '@ngneat/reactive-forms';

/**
 * Abstract directive to structure form dialog component that support create and update mode
 *
 * The init method must be called in ngOnInit
 *
 * FORM_TYPE: type of the form
 * ENTITY: type of the entity returned by the create and update method
 */
@Directive()
export abstract class FlFormDialogAbstractDirective<FORM_TYPE, ENTITY = FORM_TYPE> {

  formGp: FormGroup<FORM_TYPE>;

  isLoading: boolean = false;

  protected constructor(protected dialogInput: FlFormDialogInput<FORM_TYPE>,
                        protected snackBarService: FlSnackBarService,
                        protected dialogRef: MatDialogRef<any>) {
  }

  abstract buildForm(): FormGroup<FORM_TYPE>;

  abstract create(formValue: FORM_TYPE): Observable<ENTITY>;

  abstract update(formValue: FORM_TYPE): Observable<ENTITY>;

  abstract getCreateSuccessMessage(): string;

  abstract getUpdateSuccessMessage(): string;


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
    this.formGp.patchValue(this.dialogInput.object as any);
  }


  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.isLoading = true;

      const formValue: any = this.formGp.getRawValue();

      if (this.dialogInput.mode === 'create') {
        this.callCreate(formValue);
      } else {
        this.callUpdate(formValue);
      }
    }
  }

  private callCreate(formValue: FORM_TYPE): void {
    this.create(formValue).subscribe({
      next: newEntity => this.onSaveSuccess(newEntity, this.getCreateSuccessMessage()),
      error: () => this.isLoading = false
    });
  }

  private callUpdate(formValue: FORM_TYPE): void {
    this.update(formValue).subscribe({
      next: newEntity => this.onSaveSuccess(newEntity, this.getUpdateSuccessMessage()),
      error: () => this.isLoading = false
    });
  }

  protected onSaveSuccess(entity: ENTITY, successText: string): void {
    this.snackBarService.openSuccessMessage({text: successText, translateText: true});

    this.dialogRef.close(entity);
    this.isLoading = false;
  }

  isCreateMode(): boolean {
    return this.dialogInput.mode === 'create';
  }

  isUpdateMode(): boolean {
    return this.dialogInput.mode === 'update';
  }

}
