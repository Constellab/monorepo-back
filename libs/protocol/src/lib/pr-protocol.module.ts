import {Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PrWorkflowManagerState} from './state/pr-workflow-manager-state';
import {PrWorkflowComponent} from './component/pr-workflow/pr-workflow.component';
import {
  FlCoreComponentModule,
  FlLoaderModule,
  FlStatusModule,
  FlTranslateModule,
  FlTranslateService
} from "@monorepo/front-core-lib";
import {FlexModule} from '@angular/flex-layout';
import {PrWorkflowNodeComponent} from './component/pr-workflow-node/pr-workflow-node.component';
import {PrWorkflowNodeDirective} from './directive/pr-workflow-node.directive';
import {TdTechnicalDocModule} from '@monorepo/technical-doc';
import {MatIconModule} from '@angular/material/icon';
import {createCustomElement} from '@angular/elements';
import {PrWorkflowNodeSourceComponent} from './component/pr-workflow-node-source/pr-workflow-node-source.component';
import {PrWorkflowNodeOutputComponent} from './component/pr-workflow-node-output/pr-workflow-node-output.component';
import {
  PrWorkflowNodeInterfaceComponent
} from './component/pr-workflow-node-interface/pr-workflow-node-interface.component';
import {PrWorkflowActionState} from './state/pr-workflow-action-state';
import {PrWorkflowNodeDetailState} from './state/pr-workflow-node-detail-state';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {
  PrWorkflowLayersBreadcrumbComponent
} from './component/pr-workflow-layers-breadcrumb/pr-workflow-layers-breadcrumb.component';
import {prProtocolI18n} from './pr-protocol.i18n';

@NgModule({
  imports: [
    CommonModule,
    FlLoaderModule,
    FlCoreComponentModule,
    FlexModule,
    TdTechnicalDocModule,
    MatIconModule,
    FlStatusModule,
    FlTranslateModule,
    MatTooltipModule,
    MatButtonModule
  ],
  exports: [
    PrWorkflowComponent
  ],
  declarations: [
    PrWorkflowComponent,
    PrWorkflowNodeComponent,
    PrWorkflowNodeDirective,
    PrWorkflowNodeSourceComponent,
    PrWorkflowNodeOutputComponent,
    PrWorkflowNodeInterfaceComponent,
    PrWorkflowLayersBreadcrumbComponent
  ]
})
export class PrProtocolModule {
  private static registered: boolean = false;

  constructor(injector: Injector, translateService: FlTranslateService) {

    if (PrProtocolModule.registered) return;

    customElements.define('pr-workflow-node',
      createCustomElement(PrWorkflowNodeComponent, {
        injector
      }));

    customElements.define('pr-workflow-node-source',
      createCustomElement(PrWorkflowNodeSourceComponent, {
        injector
      }));

    customElements.define('pr-workflow-node-output',
      createCustomElement(PrWorkflowNodeOutputComponent, {
        injector
      }));

    customElements.define('pr-workflow-node-interface',
      createCustomElement(PrWorkflowNodeInterfaceComponent, {
        injector,
      }));

    PrProtocolModule.registered = true;

    translateService.addModuleTranslation('PrProtocolModule', prProtocolI18n);
  }

  public static forRoot(): ModuleWithProviders<PrProtocolModule> {
    return {
      ngModule: PrProtocolModule,
      providers: [PrWorkflowManagerState, PrWorkflowActionState, PrWorkflowNodeDetailState]
    };
  }
}
