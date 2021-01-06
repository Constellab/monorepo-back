import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SnackBarInfoComponent} from './component/snack-bar-info/snack-bar-info.component';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {ConfirmDialogComponent} from './component/confirm-dialog/confirm-dialog.component';
import {LoaderModule} from '../loader/loader.module';
import {CoreTranslateModule} from '../translate/core-translate.module';
import {ImageModule} from '../image/image.module';
import {PortalArrowComponent} from './component/portal-arrow/portal-arrow.component';
import {TooltipComponent} from './component/tooltip/tooltip.component';
import {DateRangeComponent} from './component/date-range/date-range.component';
import {CorePipeModule} from '../core-pipe/core-pipe.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {JsonEditorComponent} from './component/json-editor/json-editor.component';
import {CoreDirectiveModule} from '../core-directive/core-directive.module';
import {BreadcrumbComponent} from './component/breadcrumb/breadcrumb.component';
import {RouterModule} from '@angular/router';
import {LimitHeightComponent} from './component/limit-height/limit-height.component';
import {DialogTitleComponent} from './component/dialog-title/dialog-title.component';
import {NewWebsiteVersionComponent} from './component/new-website-version/new-website-version.component';
import {ChipComponent} from './component/chip/chip.component';
import {PaginationLoadMoreResultComponent} from './component/pagination-load-more-result/pagination-load-more-result.component';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    SnackBarInfoComponent,
    ConfirmDialogComponent,
    PortalArrowComponent,
    TooltipComponent,
    DateRangeComponent,
    JsonEditorComponent,
    BreadcrumbComponent,
    LimitHeightComponent,
    DialogTitleComponent,
    NewWebsiteVersionComponent,
    ChipComponent,
    PaginationLoadMoreResultComponent,
  ],
  exports: [
    DateRangeComponent,
    JsonEditorComponent,
    BreadcrumbComponent,
    LimitHeightComponent,
    DialogTitleComponent,
    ChipComponent,
    PaginationLoadMoreResultComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    LoaderModule,
    CoreTranslateModule,
    ImageModule,
    CorePipeModule,
    CoreDirectiveModule,

    CustomMaterialModule,
  ]
})
export class CoreComponentModule {
}
