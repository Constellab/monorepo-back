import { NgModule } from '@angular/core';
import { FlCorePipeModule, FlFormModule, FlLoaderModule } from '@monorepo/front-core-lib';

@NgModule({
    exports: [FlCorePipeModule, FlFormModule, FlLoaderModule]
})
export class DaCustomLibraryModule{}