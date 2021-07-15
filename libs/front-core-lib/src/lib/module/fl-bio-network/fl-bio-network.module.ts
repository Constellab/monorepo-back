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
import {FormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FlBioNetworkDrawerActionComponent} from './component/fl-bio-network-drawer-action/fl-bio-network-drawer-action.component';
import {FlBioNetworkConfigComponent} from './component/fl-bio-network-config/fl-bio-network-config.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flBioNetworkI18n} from './i18n/fl-bio-network.i18n';
import {FlBioNetworkComponent} from './component/fl-bio-network/fl-bio-network.component';
import {MatTabsModule} from '@angular/material/tabs';
import {FlBioNetworkActionBarComponent} from './component/fl-bio-network-action-bar/fl-bio-network-action-bar.component';

/**
 * Module to handle specific chart to show a pathway
 */
@NgModule({
  declarations: [
    FlBioNetworkComponent,
    FlBioNetworkNodeDetailComponent,
    FlBioNetworkNodeLinksComponent,
    FlBioNetworkDrawerActionComponent,
    FlBioNetworkConfigComponent,
    FlBioNetworkActionBarComponent
  ],
  exports: [
    FlBioNetworkComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,

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


    FlTranslateModule,
    FlJsonEditorModule,
    FlCoreDirectiveModule,
    FlCoreComponentModule,
  ],
})
export class FlBioNetworkModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('flBioNetworkI18nEn', flBioNetworkI18n);
  }
}
