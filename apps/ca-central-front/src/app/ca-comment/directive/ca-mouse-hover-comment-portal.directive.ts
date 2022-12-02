import {Directive, Input, OnInit} from '@angular/core';
import {FlMouseHoverPortalAbstractDirective, FlMouseHoverPortalConfig, FlOverlayRef} from '@monorepo/front-core-lib';
import {
  CaCommentMenuPortalButton,
  CaCommentMenuPortalComponent
} from '../component/ca-comment-menu-portal/ca-comment-menu-portal.component';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {CaComment} from '../../ca-core/model/entities/ca-comment.class';
import {Subject} from 'rxjs';

export interface CaMouseHoverCommentData {
  comment: CaComment;
  buttons: CaCommentMenuPortalButton[];
}

@Directive({
  selector: '[caMouseHoverCommentPortal]'
})
export class CaMouseHoverCommentPortalDirective extends FlMouseHoverPortalAbstractDirective implements OnInit {

  @Input()
  data: CaMouseHoverCommentData;

  @Input()
  isEditMode$: Subject<boolean>;

  ngOnInit(): void {
    this.isEditMode$.subscribe(isEditMode => {
      this.flDisableHover = isEditMode;
    });
  }

  getConfig(): FlMouseHoverPortalConfig | null {
    this.elementRef.nativeElement.style.cursor = 'pointer';
    const pos: ConnectedPosition[] = [{originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top'}];
    return {
      data: this.data,
      position: pos,
      component: CaCommentMenuPortalComponent,
      portalTagName: 'CA-COMMENT-MENU-PORTAL',
      overlayConfig: {
        elevation: false,
        disposeOnNavigation: true
      }
    };
  }

  onPortalClosed(event: MouseEvent): void {
  }

  onPortalOpened(overlay: FlOverlayRef, event: MouseEvent): void {
  }

}
