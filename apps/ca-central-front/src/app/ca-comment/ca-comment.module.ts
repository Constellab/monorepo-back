import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaCommentDivComponent } from './component/ca-comment-div/ca-comment-div.component';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CaCommentMenuPortalComponent } from './component/ca-comment-menu-portal/ca-comment-menu-portal.component';
import { CaMouseHoverCommentPortalDirective } from './directive/ca-mouse-hover-comment-portal.directive';



@NgModule({
  declarations: [
    CaCommentDivComponent,
    CaCommentMenuPortalComponent,
    CaMouseHoverCommentPortalDirective
  ],
  exports: [
    CaCommentDivComponent
  ],
    imports: [
        CommonModule,
        CaCoreModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class CaCommentModule { }
