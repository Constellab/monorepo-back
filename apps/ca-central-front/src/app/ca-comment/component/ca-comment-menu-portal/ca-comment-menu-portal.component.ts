import {Component, Inject, OnInit} from '@angular/core';
import {CaComment} from '../../../ca-core/model/entities/ca-comment.class';
import {FL_PORTAL_DATA, FlMenuDynamicButton, FlOverlayRef} from '@monorepo/front-core-lib';
import {CaMouseHoverCommentData} from '../../directive/ca-mouse-hover-comment-portal.directive';

export class CaCommentMenuPortalButton extends FlMenuDynamicButton {
  onClick: (event: MouseEvent, overlayRef?: FlOverlayRef) => void;
}

@Component({
  selector: 'ca-comment-menu-portal',
  templateUrl: './ca-comment-menu-portal.component.html',
  styleUrls: ['./ca-comment-menu-portal.component.scss']
})
export class CaCommentMenuPortalComponent implements OnInit {

  comment: CaComment;
  menu: CaCommentMenuPortalButton[];
  overlayRef: FlOverlayRef;

  constructor(@Inject(FL_PORTAL_DATA) data: CaMouseHoverCommentData, overlayRef: FlOverlayRef) {
    this.comment = data.comment;
    this.menu = data.buttons;
    this.overlayRef = overlayRef;
  }

  ngOnInit(): void {

  }


}
