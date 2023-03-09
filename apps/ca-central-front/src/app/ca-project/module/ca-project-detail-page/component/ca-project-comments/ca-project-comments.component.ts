import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaProject} from '../../../../../ca-core/model/entities/project/ca-project.class';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {
  CaProjectComment,
  CaProjectCommentDatasourcePaginated
} from '../../../../../ca-core/model/entities/ca-comment.class';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaAuthenticatedUserService} from '../../../../../ca-core/service-api/ca-authenticated-user.service';
import {CaCommentTextEditorConfig} from '../../../../../ca-core/model/config/ca-comment-text-editor.config';
import {FormControl, Validators} from '@angular/forms';
import {CmRichText} from '@monorepo/common-model';
import {FlConfirmDialogInput, FlDialogService, FlOverlayRef, FlPortalService} from '@monorepo/front-core-lib';
import {
  FlEmojiPickerPortalComponent
} from '@monorepo/front-core-lib';
import {CaNotificationState} from '../../../../../ca-core/state/ca-notification.state';
import {Router} from '@angular/router';
import {CaNotificationType} from '../../../../../ca-core/model/entities/ca-notification.class';


@Component({
  selector: 'ca-project-comments',
  templateUrl: './ca-project-comments.component.html',
  styleUrls: ['./ca-project-comments.component.scss']
})
export class CaProjectCommentsComponent implements OnInit, OnDestroy {

  isEmojiPickerVisible: boolean;
  openEmojiPicker: boolean = false;
  project$: Observable<CaProject>;
  comments: CaProjectCommentDatasourcePaginated;
  currentUserId: string;
  textEditorConfig: CaCommentTextEditorConfig = new CaCommentTextEditorConfig(this.projectService,
    this.state.getProjectId$());
  formControl: FormControl;
  isLoading: boolean = false;
  projectId: string;

  constructor(private state: CaProjectDetailState,
              private projectService: CaProjectService,
              private userService: CaAuthenticatedUserService,
              private portalService: FlPortalService,
              private dialogService: FlDialogService,
              private notificationState: CaNotificationState,
              private router: Router) {
  }

  ngOnInit(): void {
    this.project$ = this.state.getProject$();
    this.formControl = new FormControl({value: null}, [Validators.required, Validators.min(1)]);

    this.project$.subscribe(project => {
      this.projectId = project.id;
      this.comments = this.projectService.getProjectComments(this.projectId);
      this.readProjectCommentsNotification();

      this.projectService.getUsersOfProject(this.projectId).subscribe(users => {
        this.textEditorConfig.setUsers(users);
      });
    });

    this.currentUserId = this.userService.getUser().id;

    this.textEditorConfig.sendButtonEvent$.subscribe(btEvent => {
      if (btEvent) {
        this.createNewComment();
      }
    });

    this.textEditorConfig.sendEmojiButtonEvent$.subscribe(btEmoji => {
      if (btEmoji) {
        this.openEmojiPannel(btEmoji);
      }
    })
  }

  private readProjectCommentsNotification(): void {
    this.notificationState.readEntityNotificationsByLink(this.router.url.slice(1), CaNotificationType.PROJECT_COMMENT).subscribe();
  }

  enterEvent(event: Event): void {
    event.preventDefault();
    this.createNewComment();
  }


  private createNewComment(): void {
    if (!CmRichText.isEmpty(this.formControl.value)) {
      this.projectService.newProjectComment(this.projectId, this.formControl.value).subscribe((newComment) => {
        if (newComment) {
          this.comments.addItem(newComment, () => true);
        }
      });
      this.formControl.setValue(null);
    }
  }

  addEmoji(event: string): void {
    this.formControl.setValue(CmRichText.addEmoji(this.formControl.value, event));
  }

  eventOnMessage(event: [FlOverlayRef, string], comment: CaProjectComment): void {
    switch (event[1]) {
      case 'delete':
        const input: FlConfirmDialogInput = {
          title: 'delete_comment_title',
          content: 'delete_comment_confirmation',
          translateTitleAndContent: true,
          successMessage: 'delete_comment_success',
          translateMessage: true
        };
        this.dialogService.openConfirmDialog(input).afterClosed().subscribe((res) => {
          if(res.choice)
            this.deleteComment(this.projectId, comment);
        });
        event[0].dispose();
        break;
      case 'edit':
        event[0].dispose();
        break;
      default:
        break;
    }
  }

  private deleteComment(projectId: string, comment: CaProjectComment): void {
    this.projectService.deleteProjectComment(projectId, comment.id).subscribe(() => {
      this.comments.removeItem(comment);
    });
  }

  private openEmojiPannel(btEmoji: HTMLElement): void {
    const config = this.portalService.configureRelativePortal(btEmoji, ['top', 'bottom', 'left', 'right'],
      {
        hasBackdrop: true,
        disposeOnNavigation: true,
        disposeOnBackdropClick: true,
        transparentBackdrop: true
      });
    this.portalService.createPortal(FlEmojiPickerPortalComponent, config).detachments().subscribe(
      emoji => {
        if (emoji)
          this.addEmoji(emoji)
      }
    );
  }

  ngOnDestroy(): void {
    this.textEditorConfig.sendButtonEvent$.complete();
    this.textEditorConfig.sendEmojiButtonEvent$.complete();
  }

}
