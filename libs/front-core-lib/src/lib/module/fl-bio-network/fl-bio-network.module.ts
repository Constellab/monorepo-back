import {ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FlBioNetworkNodeDetailComponent
} from './component/fl-bio-network-node-detail/fl-bio-network-node-detail.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlJsonEditorModule} from '../fl-json-editor/fl-json-editor.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {
  FlBioNetworkNodeLinksComponent
} from './component/fl-bio-network-node-links/fl-bio-network-node-links.component';
import {MatListModule} from '@angular/material/list';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {MatSliderModule} from '@angular/material/slider';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlBioNetworkDrawerComponent} from './component/fl-bio-network-drawer/fl-bio-network-drawer.component';
import {FlBioNetworkConfigComponent} from './component/fl-bio-network-config/fl-bio-network-config.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flBioNetworkI18n} from './i18n/fl-bio-network.i18n';
import {MatTabsModule} from '@angular/material/tabs';
import {
  FlBioNetworkActionBarComponent
} from './component/fl-bio-network-action-bar/fl-bio-network-action-bar.component';
import {
  FlBioNetworkCompartmentsComponent
} from './component/fl-bio-network-compartments/fl-bio-network-compartments.component';
import {
  FlBioNetworkSelectionInfoComponent
} from './component/fl-bio-network-selection-info/fl-bio-network-selection-info.component';
import {FlDrawerModule} from '../fl-drawer/fl-drawer.module';
import {
  FlBioNetworkNodeSearchComponent
} from './component/fl-bio-network-node-search/fl-bio-network-node-search.component';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {
  FlBioNetworkReactionDetailComponent
} from './component/fl-bio-network-reaction-detail/fl-bio-network-reaction-detail.component';
import {
  FlBioNetworkMetaboliteDetailComponent
} from './component/fl-bio-network-metabolite-detail/fl-bio-network-metabolite-detail.component';
import {FlKeyValueModule} from '../fl-key-value/fl-key-value.module';
import {MatExpansionModule} from '@angular/material/expansion';
import {
  FlBioNetworkClustersListComponent
} from './component/fl-bio-network-clusters-list/fl-bio-network-clusters-list.component';
import {FlBioNetworkComponent} from './component/fl-bio-network/fl-bio-network.component';
import {
  FlBioNetworkEngineConfigComponent
} from './component/fl-bio-network-engine-config/fl-bio-network-engine-config.component';
import {
  FlBioNetworkEngineProgressComponent
} from './component/fl-bio-network-engine-progress/fl-bio-network-engine-progress.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {FlDateModule} from '../fl-date/fl-date.module';
import {
  FlBioNetworkReactionFluxComponent
} from './component/fl-bio-network-reaction-flux/fl-bio-network-reaction-flux.component';
import {
  FlBioNetworkNodeMetaboliteDetailComponent
} from './component/fl-bio-network-node-metabolite-detail/fl-bio-network-node-metabolite-detail.component';
import {
  FlBioNetworkNodeReactionDetailComponent
} from './component/fl-bio-network-node-reaction-detail/fl-bio-network-node-reaction-detail.component';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';
import {
  FlBioNetworkNodeCofactorDetailComponent
} from './component/fl-bio-network-node-cofactor-detail/fl-bio-network-node-cofactor-detail.component';
import {FlBioNetworkLegendComponent} from './component/fl-bio-network-legend/fl-bio-network-legend.component';
import {FlDialogModule} from '../fl-dialog/fl-dialog.module';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {FlBioNetworkService} from './service/fl-bio-network.service';
import {
  FlBioNetworkNodePositionsComponent
} from './component/fl-bio-network-node-positions/fl-bio-network-node-positions.component';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';

/**
 * Module to handle specific chart to show a pathway
 */
@NgModule({
  declarations: [
    FlBioNetworkNodeDetailComponent,
    FlBioNetworkNodeLinksComponent,
    FlBioNetworkDrawerComponent,
    FlBioNetworkConfigComponent,
    FlBioNetworkActionBarComponent,
    FlBioNetworkCompartmentsComponent,
    FlBioNetworkSelectionInfoComponent,
    FlBioNetworkNodeSearchComponent,
    FlBioNetworkReactionDetailComponent,
    FlBioNetworkMetaboliteDetailComponent,
    FlBioNetworkClustersListComponent,
    FlBioNetworkComponent,
    FlBioNetworkEngineConfigComponent,
    FlBioNetworkEngineProgressComponent,
    FlBioNetworkReactionFluxComponent,
    FlBioNetworkNodeMetaboliteDetailComponent,
    FlBioNetworkNodeReactionDetailComponent,
    FlBioNetworkNodeCofactorDetailComponent,
    FlBioNetworkLegendComponent,
    FlBioNetworkNodePositionsComponent,
  ],
  exports: [
    FlBioNetworkComponent,
    FlBioNetworkNodePositionsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatSidenavModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatSliderModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatProgressBarModule,
    ScrollingModule,

    FlTranslateModule,
    FlJsonEditorModule,
    FlCoreDirectiveModule,
    FlCoreComponentModule,
    FlDrawerModule,
    FlKeyValueModule,
    FlDateModule,
    FlTextIconModule,
    FlDialogModule,
    FlLoaderModule,
    FlCorePipeModule,
  ],
})
export class FlBioNetworkModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlBioNetworkModule', flBioNetworkI18n);
  }

  public static forRoot(bioNetworkServiceClass?: Type<FlBioNetworkService>): ModuleWithProviders<FlBioNetworkModule> {
    const providers: Provider[] = [];
    if (bioNetworkServiceClass) {
      providers.push({provide: FlBioNetworkService, useClass: bioNetworkServiceClass});
    }

    return {
      ngModule: FlBioNetworkModule,
      providers: providers,
    };
  }
}
