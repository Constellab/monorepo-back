import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '@monorepo/front-core-lib';
import {LabCodeEditorLanguage} from '../../../../standalone-component/lab-code-editor/lab-code-editor.class';
import {TdParamSpecType} from '@monorepo/technical-doc';

/**
 * Component used under {@link FlDynamicFieldComponent} to show
 * code editor.
 * It lazy load the standalone python code component, so it is not
 * included in the main bundle.
 */
@Component({
  selector: 'lab-code-editor-dynamic-field',
  templateUrl: './lab-code-editor-dynamic-field.component.html',
  styleUrls: ['./lab-code-editor-dynamic-field.component.scss']
})
export class LabCodeEditorDynamicFieldComponent extends FlDynamicFieldAbstractDirective
  implements OnInit, OnDestroy {

  @Input() specType: TdParamSpecType;

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private componentRef: ComponentRef<any>;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  async ngOnInit(): Promise<void> {
    const {LabCodeEditorComponent} = await import('../../../../standalone-component/lab-code-editor/lab-code-editor.component');
    this.componentRef = this.viewContainer.createComponent(LabCodeEditorComponent);
    this.componentRef.instance.formCtrl = this.formCtrl;
    this.componentRef.instance.language = this.getCodeEditorLanguage();
    // use change detection to force the OnInit of LabPythonEditorComponent to be called
    // because of the parent ChangeDetectionStrategy.OnPush, the OnInit of the lazy loaded
    // component is not called
    this.changeDetectorRef.markForCheck();
  }

  private getCodeEditorLanguage(): LabCodeEditorLanguage {
    switch (this.specType) {
      case 'python_code_param':
        return 'python';
      case 'r_code_param':
        return 'r';
      case 'bash_code_param':
        return 'shell';
      case 'json_code_param':
        return 'json';
      case 'yaml_code_param':
        return 'yaml';
      case 'julia_code_param':
        return 'julia';
      case 'perl_code_param':
        return 'perl';
      default:
        throw new Error(`Unknown spec type ${this.specType}`);

    }
  }

  ngOnDestroy(): void {
    this.componentRef.destroy();
  }


}
