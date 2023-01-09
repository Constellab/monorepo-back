import {
  FlDynamicFieldAbstractDirective,
  FlDynamicFieldBooleanComponent,
  FlDynamicFieldConfig,
  FlDynamicFieldConfigBase,
  FlDynamicFieldConfigInput,
  FlDynamicFieldConfigList,
  FlDynamicFieldConfigSelect,
  FlDynamicFieldInputComponent,
  FlDynamicFieldListComponent,
  FlDynamicFieldSelectComponent
} from '@monorepo/front-core-lib';
import {ComponentRef, Injectable, ViewContainerRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
  FlDynamicFieldTextareaComponent
} from '../component/fl-dynamic-field-textarea/fl-dynamic-field-textarea.component';

/**
 * Configuration for the {@link FlDynamicFieldComponent}
 * Override the getAdditionalConfig method to add new field type
 */
@Injectable({
  providedIn: 'root'
})
export class FlDynamicFieldConfigService {

  protected getAdditionalConfig(): Record<string, FlDynamicFieldAdditionalConfig> {
    return {};
  }

  private isAdditionalType(type: string): boolean {
    return this.getAdditionalConfig()[type] != null;
  }

  /**
   * Generate the component from the config of the field
   * @param config
   * @param viewContainer
   * @param formCtrl
   */
  public generateComponent(config: FlDynamicFieldConfig,
                           viewContainer: ViewContainerRef, formCtrl: FormControl): ComponentRef<FlDynamicFieldAbstractDirective> {

    let viewComponentRef: ComponentRef<FlDynamicFieldAbstractDirective>;

    // if the type is supported by the module config, use it
    if (this.isAdditionalType(config.type)) {
      const additionalConfig = this.getAdditionalConfig()[config.type];
      viewComponentRef = additionalConfig(viewContainer, config);
    } else {
      switch (config.type) {
        case 'input':
          viewComponentRef = this.createInputComponent(viewContainer, config as FlDynamicFieldConfigInput);
          break;
        case 'select':
          viewComponentRef = this.createSelectComponent(viewContainer, config as FlDynamicFieldConfigSelect);
          break;
        case 'list':
          viewComponentRef = this.createListComponent(viewContainer, config as FlDynamicFieldConfigList);
          break;
        case 'boolean':
          viewComponentRef = this.createBooleanComponent(viewContainer);
          break;
        case 'textarea':
          viewComponentRef = this.createTextareaComponent(viewContainer);
          break;
        default:
          throw new Error('Unknown type: ' + config.type);
      }
    }


    // add generic properties
    viewComponentRef.instance.formCtrl = formCtrl;
    viewComponentRef.instance.placeholder = config.placeholder;
    viewComponentRef.instance.hint = config.hint;
    viewComponentRef.instance.disabled = !!config.disabled;
    viewComponentRef.instance.required = !!config.required;

    return viewComponentRef;
  }


  private createInputComponent(viewContainer: ViewContainerRef,
                               config: FlDynamicFieldConfigInput): ComponentRef<FlDynamicFieldAbstractDirective> {
    const inputComponent = viewContainer.createComponent(FlDynamicFieldInputComponent);
    inputComponent.instance.prefix = config.prefix;
    inputComponent.instance.suffix = config.suffix;
    inputComponent.instance.inputType = config.inputType;
    inputComponent.instance.min = config.min;
    inputComponent.instance.max = config.max;
    inputComponent.instance.integer = config.integer;
    return inputComponent;
  }

  private createSelectComponent(viewContainer: ViewContainerRef,
                                config: FlDynamicFieldConfigSelect): ComponentRef<FlDynamicFieldAbstractDirective> {
    const selectComponent = viewContainer.createComponent(FlDynamicFieldSelectComponent);
    selectComponent.instance.selectOptions = config.selectOptions;
    selectComponent.instance.prefix = config.prefix;
    selectComponent.instance.suffix = config.suffix;
    return selectComponent;
  }

  private createListComponent(viewContainer: ViewContainerRef,
                              config: FlDynamicFieldConfigList): ComponentRef<FlDynamicFieldAbstractDirective> {
    const listComponent = viewContainer.createComponent(FlDynamicFieldListComponent);
    listComponent.instance.prefix = config.prefix;
    listComponent.instance.suffix = config.suffix;
    return listComponent;
  }

  private createBooleanComponent(viewContainer: ViewContainerRef): ComponentRef<FlDynamicFieldAbstractDirective> {
    return viewContainer.createComponent(FlDynamicFieldBooleanComponent);
  }

  private createTextareaComponent(viewContainer: ViewContainerRef): ComponentRef<FlDynamicFieldAbstractDirective> {
    return viewContainer.createComponent(FlDynamicFieldTextareaComponent);
  }
}

export type FlDynamicFieldAdditionalConfig = (viewContainer: ViewContainerRef,
                                              config: FlDynamicFieldConfigBase) => ComponentRef<FlDynamicFieldAbstractDirective>;
