import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaProjectCoreModule} from '../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {CaMyProjectsPageComponent} from './component/ca-my-projects-page/ca-my-projects-page.component';
import {CaProjectRoutingModule} from './ca-project-routing.module';

/**
 * Modules for the 'My projects' page
 */
@NgModule({
  declarations: [
    CaMyProjectsPageComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
    CaProjectCoreModule,

    CaProjectRoutingModule,
  ]
})
export class CaProjectModule {
}
