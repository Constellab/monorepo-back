/**
 * Regrouped all the needed import from library
 *
 * All the module should be in export
 */
import {NgModule} from '@angular/core';
import {FlCardModule, FlImageModule} from '@monorepo/front-core-lib';

@NgModule({
  exports: [
    FlCardModule,
    FlImageModule,
  ]
})
export class CustomLibraryModule {
}
