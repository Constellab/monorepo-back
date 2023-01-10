import {
  FlDynamicFieldAbstractDirective,
  FlDynamicFieldAdditionalConfig,
  FlDynamicFieldConfigService,
  FlDynamicFieldConfigUnknown
} from '@monorepo/front-core-lib';
import {ComponentRef, Injectable, ViewContainerRef} from '@angular/core';
import {LabTagDynamicFieldComponent} from './component/lab-tag-dynamic-field/lab-tag-dynamic-field.component';
import {
  LabCodeEditorDynamicFieldComponent
} from './component/lab-code-editor-dynamic-field/lab-code-editor-dynamic-field.component';
import {tdCodeParamSpecTypeList, TdParamSpecType} from '@monorepo/technical-doc';

/**
 * Configuration for the {@link FlDynamicFieldComponent} that include tags field and other custom field
 */
@Injectable()
export class LabConfigureProcessDynamicField extends FlDynamicFieldConfigService {


  protected getAdditionalConfig(): Record<string, FlDynamicFieldAdditionalConfig> {
    const config: Record<string, FlDynamicFieldAdditionalConfig> = {
      'tags': this.buildTagField,
    }

    // for each code spec type, set the code editor component
    for(const codeSpec of tdCodeParamSpecTypeList){
      config[codeSpec] = this.buildCodeEditorField;
    }
    return config;
  }

  private buildTagField(viewContainer: ViewContainerRef): ComponentRef<FlDynamicFieldAbstractDirective> {
    return viewContainer.createComponent(LabTagDynamicFieldComponent);
  }

  private buildCodeEditorField(viewContainer: ViewContainerRef,
                               config: FlDynamicFieldConfigUnknown): ComponentRef<FlDynamicFieldAbstractDirective> {
    const component = viewContainer.createComponent(LabCodeEditorDynamicFieldComponent);
    component.instance.specType = config.type as TdParamSpecType;
    return component;
  }


}
