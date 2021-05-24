import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {BioxExperimentDetailPageComponent} from './component/biox-experiment-detail-page/biox-experiment-detail-page.component';
import {BioxExperimentCoreModule} from '../../../core/entity-module/biox-experiment-core/biox-experiment-core.module';
import {BioxWorkflowNodeComponent} from './component/biox-workflow-node/biox-workflow-node.component';
import {BioxWorkflowComponent} from './component/biox-workflow/biox-workflow.component';
import {createCustomElement} from '@angular/elements';
import {BioxProtocolCoreModule} from '../../../core/entity-module/biox-protocol-core/biox-protocol-core.module';
import {BioxProcessCoreModule} from '../../../core/entity-module/biox-process-core/biox-process-core.module';
import {BioxWorkflowLayersBreadcrumbComponent} from './component/biox-workflow-layers-breadcrumb/biox-workflow-layers-breadcrumb.component';
import {BioxResourceCoreModule} from '../../../core/entity-module/biox-resource-core/biox-resource-core.module';
import {BioxConfigCoreModule} from '../../../core/entity-module/biox-config-core/biox-config-core.module';
import {BioxWorkflowNodeInterfaceComponent} from './component/biox-workflow-interface/biox-workflow-node-interface.component';
import {BioxWorkflowActionsComponent} from './component/biox-workflow-actions/biox-workflow-actions.component';
import {WorkflowManagerState} from './state/workflow-manager-state';
import {BioxProcessTypeModule} from '../../../core/entity-module/biox-process-type/biox-process-type.module';
import {BioxWorkflowNodeDetailComponent} from './component/biox-workflow-node-detail/biox-workflow-node-detail.component';
import {WorkflowActionState} from './state/workflow-action-state.service';
import {BioxWorkflowDrawerComponent} from './component/biox-workflow-drawer/biox-workflow-drawer.component';
import {BioxExperimentDetailPageState} from './state/biox-experiment-detail-page.state';
import {BioxWorkflowDrawerActionComponent} from './component/biox-workflow-drawer-action/biox-workflow-drawer-action.component';
import { BioxWorkflowAddProcessComponent } from './component/biox-workflow-add-process/biox-workflow-add-process.component';
import { BioxWorkflowPortsListComponent } from './component/biox-workflow-ports-list/biox-workflow-ports-list.component';
import { BioxWorkflowPortComponent } from './component/biox-workflow-port/biox-workflow-port.component';
import { BioxWorkflowNodeConfigComponent } from './component/biox-workflow-node-config/biox-workflow-node-config.component';
import { BioxWorkflowNodeProgressComponent } from './component/biox-workflow-node-progress/biox-workflow-node-progress.component';


@NgModule({
  declarations: [
    BioxExperimentDetailPageComponent,
    BioxWorkflowNodeComponent,
    BioxWorkflowComponent,
    BioxWorkflowLayersBreadcrumbComponent,
    BioxWorkflowNodeInterfaceComponent,
    BioxWorkflowActionsComponent,
    BioxWorkflowNodeDetailComponent,
    BioxWorkflowDrawerComponent,
    BioxWorkflowDrawerActionComponent,
    BioxWorkflowAddProcessComponent,
    BioxWorkflowPortsListComponent,
    BioxWorkflowPortComponent,
    BioxWorkflowNodeConfigComponent,
    BioxWorkflowNodeProgressComponent,
  ],
  imports: [
    CommonModule,

    CoreModule,
    BioxExperimentCoreModule,
    BioxProtocolCoreModule,
    BioxProcessCoreModule,
    BioxResourceCoreModule,
    BioxConfigCoreModule,
    BioxProcessTypeModule,
  ],
  providers: [WorkflowManagerState, WorkflowActionState, BioxExperimentDetailPageState]
})
export class BioxExperimentDetailPageModule {
  constructor(injector: Injector) {

    // declare the BioxWorkflowNodeComponent as angular element to make the tag
    // biox-workflow-node work natively
    const ngElement = createCustomElement(BioxWorkflowNodeComponent, {
      injector,
    });

    customElements.define('biox-workflow-node', ngElement);

    // declare the BioxWorkflowInterfaceComponent as angular element to make the tag
    // biox-workflow-node-interface work natively
    const ngElement2 = createCustomElement(BioxWorkflowNodeInterfaceComponent, {
      injector,
    });

    customElements.define('biox-workflow-node-interface', ngElement2);
  }
}
