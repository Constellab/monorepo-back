import {ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TdResourceDocComponent} from './component/td-resource-doc/td-resource-doc.component';
import {TdTechnicalDocComponent} from './component/td-technical-doc/td-technical-doc.component';
import {RouterModule} from '@angular/router';
import {TdMainDocComponent} from './component/td-main-doc/td-main-doc.component';
import {TdProcessDocComponent} from './component/td-process-doc/td-process-doc.component';
import {MatIconModule} from '@angular/material/icon';
import {
  FlCoreComponentModule,
  FlCorePipeModule,
  FlKeyValueModule,
  FlTranslateModule,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {TdIoDocsComponent} from './component/td-io-docs/td-io-docs.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {FlexModule} from '@angular/flex-layout';
import {TdIoResourceComponent} from './component/td-io-resource/td-io-resource.component';
import {tdTechnicalDocI18n} from './td-technical-doc.i18n';
import {TdServiceConfig} from './service/td-service-config.config';
import {TdTechDocLinkComponent} from './component/td-tech-doc-link/td-tech-doc-link.component';
import {TdMarkdownPipe} from './pipe/td-markdown.pipe';
import {TdConfigComponent} from './component/td-config/td-config.component';
import {TdTechnicalDocHeaderComponent} from './component/td-technical-doc-header/td-technical-doc-header.component';
import {TdDocIoComponent} from './component/td-doc-io/td-doc-io.component';
import {MatTooltipModule} from "@angular/material/tooltip";

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
    FlTranslateModule,
    MatTooltipModule
  ],
  declarations: [
    TdResourceDocComponent,
    TdTechnicalDocComponent,
    TdMainDocComponent,
    TdProcessDocComponent,
    TdIoDocsComponent,
    TdIoResourceComponent,
    TdTechDocLinkComponent,
    TdMarkdownPipe,
    TdConfigComponent,
    TdTechnicalDocHeaderComponent,
    TdDocIoComponent
  ],
  exports: [
    TdTechnicalDocComponent,
    TdResourceDocComponent,
    TdMainDocComponent,
    TdTechnicalDocHeaderComponent,
    TdIoDocsComponent
  ]
})
export class TdTechnicalDocModule {

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('TdTechnicalDocModule', tdTechnicalDocI18n)
  }

  public static forRoot(apiServiceConfig: Type<TdServiceConfig>): ModuleWithProviders<TdTechnicalDocModule> {

    const providers: Provider[] = [
      {provide: TdServiceConfig, useClass: apiServiceConfig}
    ];

    return {
      ngModule: TdTechnicalDocModule,
      providers: providers
    }
  }
}
