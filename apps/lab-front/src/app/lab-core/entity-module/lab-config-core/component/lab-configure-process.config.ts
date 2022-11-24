import {
  FlDynamicFieldAbstractDirective,
  FlDynamicFieldAdditionalConfig,
  FlDynamicFieldConfigService
} from '@monorepo/front-core-lib';
import {ComponentRef, Injectable, ViewContainerRef} from '@angular/core';
import {LabTagDynamicFieldComponent} from './lab-tag-dynamic-field/lab-tag-dynamic-field.component';

/**
 * Configuration for the {@link FlDynamicFieldComponent} that include tags field and other custom field
 */
@Injectable()
export class LabConfigureProcessConfig extends FlDynamicFieldConfigService {


  protected getAdditionalConfig(): Record<string, FlDynamicFieldAdditionalConfig> {
    return {
      'tags': this.buildTagField
    };
  }

  private buildTagField(viewContainer: ViewContainerRef): ComponentRef<FlDynamicFieldAbstractDirective> {
    return viewContainer.createComponent(LabTagDynamicFieldComponent);
  }


}
