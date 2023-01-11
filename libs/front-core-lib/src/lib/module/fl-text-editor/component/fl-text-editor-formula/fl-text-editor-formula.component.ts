import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FlTextEditorElementDirective} from '../../model/fl-text-editor-element.directive';
import {FlTextEditorsManagerState} from '../../state/fl-text-editors-manager.state';
import {Observable} from 'rxjs';
import {FlDialogService} from '../../../fl-dialog/fl-dialog.service';
import {
  FlTextEditorFormulaDialogComponent,
  FlTextEditorFormulaDialogInput
} from '../fl-text-editor-formula-dialog/fl-text-editor-formula-dialog.component';

@Component({
  selector: 'fl-text-editor-formula',
  templateUrl: './fl-text-editor-formula.component.html',
  styleUrls: ['./fl-text-editor-formula.component.scss']
})
export class FlTextEditorFormulaComponent extends FlTextEditorElementDirective
  implements OnInit, OnDestroy {

  @HostBinding('attr.formula')
  @Input() formula: string;

  @HostBinding('attr.formula-title')
  @Input() formulaTitle: string;

  @HostBinding('attr.caption')
  @Input() caption: string;

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  disabled$: Observable<boolean>;

  private componentRef: ComponentRef<any>;

  constructor(elementRef: ElementRef<HTMLElement>,
              managersState: FlTextEditorsManagerState,
              private changeDetectorRef: ChangeDetectorRef,
              private dialogService: FlDialogService) {
    super(elementRef, managersState);
  }

  async ngOnInit(): Promise<void> {
    const {FlFormulaComponent} = await import('../../../../standalone-component/fl-formula/fl-formula.component');
    this.componentRef = this.viewContainer.createComponent(FlFormulaComponent);
    this.componentRef.instance.formula = this.formula;
    this.changeDetectorRef.markForCheck();
    this.disabled$ = this.getDisabled$();
  }

  updateFormula(): void {
    const input: FlTextEditorFormulaDialogInput = {
      mode: 'update',
      object: this.formula,
    };
    this.dialogService.openSmallDialog(FlTextEditorFormulaDialogComponent, {data: input})
      .afterClosed().subscribe((formula: string) => this.onFormulaDialogClosed(formula));
  }

  private onFormulaDialogClosed(formula?: string): void {
    if (formula) {
      this.formula = formula;
      this.componentRef.instance.formula = formula;
      this.changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.componentRef.destroy();
  }


}
