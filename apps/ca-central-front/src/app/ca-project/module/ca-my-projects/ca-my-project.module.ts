import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaProjectCoreModule} from '../../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {CaMyProjectsPageComponent} from './ca-my-projects-page/ca-my-projects-page.component';
import {CaMyProjectRoutingModule} from './ca-my-project-routing.module';

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

    CaMyProjectRoutingModule,
  ]
})
export class CaMyProjectModule {
}
