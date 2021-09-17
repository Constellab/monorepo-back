import { NgModule } from "@angular/core";
import { FlCorePipeModule, FlFormModule } from "@monorepo/front-core-lib";

@NgModule({
    exports: [FlCorePipeModule, FlFormModule]
})
export class DaCustomLibraryModule{}