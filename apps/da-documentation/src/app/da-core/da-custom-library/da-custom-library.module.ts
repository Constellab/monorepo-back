import { NgModule } from '@angular/core';
import { 
    FlCorePipeModule, 
    FlDialogModule, 
    FlFormModule, 
    FlLoaderModule, 
    FlSnackBarModule, 
    FlTranslateModule 
} from '@monorepo/front-core-lib';

@NgModule({
    exports: [FlCorePipeModule, FlFormModule, FlLoaderModule, FlDialogModule, FlSnackBarModule, FlTranslateModule]
})
export class DaCustomLibraryModule{}