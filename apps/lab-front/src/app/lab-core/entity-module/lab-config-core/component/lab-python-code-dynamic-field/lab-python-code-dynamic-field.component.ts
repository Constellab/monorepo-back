import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '@monorepo/front-core-lib';
import {LabPythonEditorComponent} from '../../../../standalone-component/lab-python-editor/lab-python-editor.component';

/**
 * Component used under {@link FlDynamicFieldComponent} to show
 * python code.
 * It lazy load the standalone python code component so it is not
 * included in the main bundle.
 */
@Component({
  selector: 'lab-python-code-dynamic-field',
  templateUrl: './lab-python-code-dynamic-field.component.html',
  styleUrls: ['./lab-python-code-dynamic-field.component.scss']
})
export class LabPythonCodeDynamicFieldComponent extends FlDynamicFieldAbstractDirective
  implements OnInit, OnDestroy {

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private componentRef: ComponentRef<LabPythonEditorComponent>;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  async ngOnInit(): Promise<void> {
    const {LabPythonEditorComponent} = await import('../../../../standalone-component/lab-python-editor/lab-python-editor.component');
    this.componentRef = this.viewContainer.createComponent(LabPythonEditorComponent);
    this.componentRef.instance.formCtrl = this.formCtrl;
    // use change detection to force the OnInit of LabPythonEditorComponent to be called
    // because of the parent ChangeDetectionStrategy.OnPush, the OnInit of the lazy loaded
    // component is not called
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.componentRef.destroy();
  }


}
