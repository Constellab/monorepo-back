import { NgModule } from "@angular/core";
import { DaCustomLibraryModule } from "./custom-library/da-custom-library.module";
import { DaCustomMaterialModule } from "./custom-material/da-custom-material.module";

@NgModule({
    exports: [
        DaCustomLibraryModule,
        DaCustomMaterialModule
    ]
})
export class DaCoreModule{}