import {ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TdResourceDocViewComponent} from './component/td-resource-doc-view/td-resource-doc-view.component';
import {TdTechnicalDocViewComponent} from './component/td-technical-doc-view/td-technical-doc-view.component';
import {RouterModule} from "@angular/router";
import {TdMainDocViewComponent} from './component/td-main-doc-view/td-main-doc-view.component';
import {TdTaskDocViewComponent} from './component/td-task-doc-view/td-task-doc-view.component';
import {MatIconModule} from '@angular/material/icon';
import {
  FlCoreComponentModule,
  FlCorePipeModule,
  FlKeyValueModule,
  FlTranslateModule,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {TdIoDocViewComponent} from './component/td-io-doc-view/td-io-doc-view.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatDividerModule} from "@angular/material/divider";
import {FlexModule} from '@angular/flex-layout';
import {TdIoResourceViewComponent} from './component/td-io-resource-view/td-io-resource-view.component';
import {tdTechnicalDocI18n} from './td-technical-doc.i18n';
import {TdProtocolDocViewComponent} from './component/td-protocol-doc-view/td-protocol-doc-view.component';
import {TdServiceConfig} from './service/td-service-config.config';
import { TdTechDocLinkComponent } from './component/td-tech-doc-link/td-tech-doc-link.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    FlCorePipeModule,
    MatChipsModule,
    FlKeyValueModule,
    MatDividerModule,
    FlexModule,
    FlCoreComponentModule,
    FlTranslateModule
  ],
  declarations: [
    TdResourceDocViewComponent,
    TdTechnicalDocViewComponent,
    TdMainDocViewComponent,
    TdTaskDocViewComponent,
    TdIoDocViewComponent,
    TdIoResourceViewComponent,
    TdProtocolDocViewComponent,
    TdTechDocLinkComponent
  ],
  exports: [
    TdTechnicalDocViewComponent,
    TdResourceDocViewComponent,
    TdMainDocViewComponent
  ]
})
export class TdTechnicalDocModule {

  public static forRoot(apiServiceConfig: Type<TdServiceConfig>): ModuleWithProviders<TdTechnicalDocModule> {

    const providers: Provider[] = [
      {provide: TdServiceConfig, useClass: apiServiceConfig}
    ];

    return {
      ngModule: TdTechnicalDocModule,
      providers: providers
    }
  }

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('TdTechnicalDocModule', tdTechnicalDocI18n)
  }
}
