import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {BioxExperimentDetailPageComponent} from './component/biox-experiment-detail-page/biox-experiment-detail-page.component';
import {BioxExperimentCoreModule} from '../../../core/entity-module/biox-experiment-core/biox-experiment-core.module';
import {ExperimentWorkflowNodeComponent} from './component/experiment-workflow-node/experiment-workflow-node.component';
import {ExperimentWorkflowComponent} from './component/experiment-workflow/experiment-workflow.component';
import {createCustomElement} from '@angular/elements';
import {WorkflowManagerService} from './service/workflow-manager.service';
import {BioxProtocolCoreModule} from '../../../core/entity-module/biox-protocol-core/biox-protocol-core.module';
import {BioxProcessCoreModule} from '../../../core/entity-module/biox-process-core/biox-process-core.module';
import {BioxWorkflowLayersBreadcrumbComponent} from './component/biox-workflow-layers-breadcrumb/biox-workflow-layers-breadcrumb.component';
import {BioxResourceCoreModule} from '../../../core/entity-module/biox-resource-core/biox-resource-core.module';
import {BioxConfigCoreModule} from '../../../core/entity-module/biox-config-core/biox-config-core.module';


@NgModule({
  declarations: [
    BioxExperimentDetailPageComponent,
    ExperimentWorkflowNodeComponent,
    ExperimentWorkflowComponent,
    BioxWorkflowLayersBreadcrumbComponent,
  ],
  imports: [
    CommonModule,

    CoreModule,
    BioxExperimentCoreModule,
    BioxProtocolCoreModule,
    BioxProcessCoreModule,
    BioxResourceCoreModule,
    BioxConfigCoreModule,
  ],
  providers: [WorkflowManagerService]
})
export class BioxExperimentDetailPageModule {
  constructor(injector: Injector) {

    // declare the ExperimentWorkflowNodeComponent as angular element to make the tag
    // experiment-workflow-node work natively
    const ngElement = createCustomElement(ExperimentWorkflowNodeComponent, {
      injector,
    });

    customElements.define(`experiment-workflow-node`, ngElement);
  }
}
