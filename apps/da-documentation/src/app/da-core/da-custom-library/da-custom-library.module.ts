import { NgModule } from '@angular/core';
import { FlCorePipeModule, FlDialogModule, FlFormModule, FlLoaderModule, FlSnackBarModule } from '@monorepo/front-core-lib';

@NgModule({
    exports: [FlCorePipeModule, FlFormModule, FlLoaderModule, FlDialogModule, FlSnackBarModule]
})
export class DaCustomLibraryModule{}