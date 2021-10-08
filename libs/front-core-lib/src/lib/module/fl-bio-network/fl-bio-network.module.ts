import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlBioNetworkNodeDetailComponent} from './component/fl-bio-network-node-detail/fl-bio-network-node-detail.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlJsonEditorModule} from '../fl-json-editor/fl-json-editor.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlBioNetworkNodeLinksComponent} from './component/fl-bio-network-node-links/fl-bio-network-node-links.component';
import {MatListModule} from '@angular/material/list';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {MatSliderModule} from '@angular/material/slider';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FlBioNetworkDrawerComponent} from './component/fl-bio-network-drawer/fl-bio-network-drawer.component';
import {FlBioNetworkConfigComponent} from './component/fl-bio-network-config/fl-bio-network-config.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flBioNetworkI18n} from './i18n/fl-bio-network.i18n';
import {FlBioNetworkComponent} from './component/fl-bio-network/fl-bio-network.component';
import {MatTabsModule} from '@angular/material/tabs';
import {FlBioNetworkActionBarComponent} from './component/fl-bio-network-action-bar/fl-bio-network-action-bar.component';
import {FlBioNetworkCompartmentsComponent} from './component/fl-bio-network-compartments/fl-bio-network-compartments.component';
import {FlBioNetworkZoomComponent} from './component/fl-bio-network-zoom/fl-bio-network-zoom.component';
import {FlBioNetworkSelectionInfoComponent} from './component/fl-bio-network-selection-info/fl-bio-network-selection-info.component';
import {FlDrawerModule} from '../fl-drawer/fl-drawer.module';
import {FlBioNetworkNodeSearchComponent} from './component/fl-bio-network-node-search/fl-bio-network-node-search.component';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

/**
 * Module to handle specific chart to show a pathway
 */
@NgModule({
  declarations: [
    FlBioNetworkComponent,
    FlBioNetworkNodeDetailComponent,
    FlBioNetworkNodeLinksComponent,
    FlBioNetworkDrawerComponent,
    FlBioNetworkConfigComponent,
    FlBioNetworkActionBarComponent,
    FlBioNetworkCompartmentsComponent,
    FlBioNetworkZoomComponent,
    FlBioNetworkSelectionInfoComponent,
    FlBioNetworkNodeSearchComponent
  ],
  exports: [
    FlBioNetworkComponent,
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
    MatSlideToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatInputModule,
    MatAutocompleteModule,


    FlTranslateModule,
    FlJsonEditorModule,
    FlCoreDirectiveModule,
    FlCoreComponentModule,
    FlDrawerModule,
  ],
})
export class FlBioNetworkModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlBioNetworkModule', flBioNetworkI18n);
  }
}
