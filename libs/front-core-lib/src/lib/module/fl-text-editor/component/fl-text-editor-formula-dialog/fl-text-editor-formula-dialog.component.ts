import {Component, ComponentRef, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {Validators} from '@angular/forms';
import {FlFormDialogInput} from '../../../../model/fl-form.class';
import {debounceTime} from 'rxjs/operators';
import {startWith} from 'rxjs';

export type FlTextEditorFormulaDialogInput = FlFormDialogInput<string>;

@Component({
  selector: 'fl-text-editor-formula-dialog',
  templateUrl: './fl-text-editor-formula-dialog.component.html',
  styleUrls: ['./fl-text-editor-formula-dialog.component.scss']
})
export class FlTextEditorFormulaDialogComponent implements OnInit, OnDestroy {

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  formulaControl: FormControl<string>;

  private componentRef: ComponentRef<any>;


  constructor(@Inject(MAT_DIALOG_DATA) private input: FlTextEditorFormulaDialogInput,
              private dialogRef: MatDialogRef<FlTextEditorFormulaDialogComponent>) {
  }

  async ngOnInit(): Promise<void> {
    this.formulaControl = new FormControl(this.input.object, [Validators.required]);

    const {FlFormulaComponent} = await import('../../../../standalone-component/fl-formula/fl-formula.component');
    this.componentRef = this.viewContainer.createComponent(FlFormulaComponent);
    this.componentRef.instance.formula = this.formulaControl.valueChanges.pipe(
      startWith(this.formulaControl.value),
      debounceTime(300));
  }

  get title(): string {
    return this.input.mode === 'create' ? 'flTextEditor.add_formula' : 'flTextEditor.edit_formula';
  }

  submit(): void {
    if (this.formulaControl.valid) {
      this.dialogRef.close(this.formulaControl.value);
    }
  }

  ngOnDestroy(): void {
    this.componentRef.destroy();
  }

}
