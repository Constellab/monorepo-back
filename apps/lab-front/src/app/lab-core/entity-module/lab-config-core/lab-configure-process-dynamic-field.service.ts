import {
  FlDynamicFieldAbstractDirective,
  FlDynamicFieldAdditionalConfig,
  FlDynamicFieldConfigService
} from '@monorepo/front-core-lib';
import {ComponentRef, Injectable, ViewContainerRef} from '@angular/core';
import {LabTagDynamicFieldComponent} from './component/lab-tag-dynamic-field/lab-tag-dynamic-field.component';
import {
  LabPythonCodeDynamicFieldComponent
} from './component/lab-python-code-dynamic-field/lab-python-code-dynamic-field.component';

/**
 * Configuration for the {@link FlDynamicFieldComponent} that include tags field and other custom field
 */
@Injectable()
export class LabConfigureProcessDynamicField extends FlDynamicFieldConfigService {


  protected getAdditionalConfig(): Record<string, FlDynamicFieldAdditionalConfig> {
    return {
      'tags': this.buildTagField,
      'pythonCode': this.buildPythonCodeField,
    };
  }

  private buildTagField(viewContainer: ViewContainerRef): ComponentRef<FlDynamicFieldAbstractDirective> {
    return viewContainer.createComponent(LabTagDynamicFieldComponent);
  }

  private buildPythonCodeField(viewContainer: ViewContainerRef): ComponentRef<FlDynamicFieldAbstractDirective> {
    return viewContainer.createComponent(LabPythonCodeDynamicFieldComponent);
  }


}
