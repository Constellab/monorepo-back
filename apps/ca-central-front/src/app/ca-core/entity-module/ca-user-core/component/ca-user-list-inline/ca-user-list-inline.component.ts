import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {map} from 'rxjs/operators';
import {FlOverlayRef, FlPortalConnectedPosition, FlPortalService} from '@monorepo/front-core-lib';

interface UserList {
  previewUsers: CaUser[];
  additionalUsers: CaUser[];

}

/**
 * Show a condensed list of user in one line
 */
@Component({
  selector: 'ca-user-list-inline',
  templateUrl: './ca-user-list-inline.component.html',
  styleUrls: ['./ca-user-list-inline.component.scss']
})
export class CaUserListInlineComponent implements OnInit, OnDestroy {

  @Input() users$: Observable<CaUser[]>;

  @Input() previewListSize: number = 6;

  @ViewChild('additionalUsers', {static: false}) additionalUsers: TemplateRef<unknown>;

  userList$: Observable<UserList>;

  private additionalOverlay: FlOverlayRef;

  constructor(private portalService: FlPortalService,
              private viewContainerRef: ViewContainerRef) {
  }

  ngOnInit(): void {
    // slice the array to the preview limite and reverse it as it is reverse in the html
    this.userList$ = this.users$.pipe(
      map(users => ({
        previewUsers: users.slice(0, this.previewListSize).reverse(),
        additionalUsers: users.slice(this.previewListSize)
      }))
    );
  }

  openAdditionalUsersPortal(event: MouseEvent): void {
    if (this.additionalOverlay) return;

    const position: FlPortalConnectedPosition[] = [{
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top'
    }];

    const config = this.portalService.configureRelativePortalFromMouseEvent(event, position,
      {
        scrollStrategy: this.portalService.getCloseOnScrollStrategy(),
        panelClass: 'g-portal-background',
        elevation: true,
        disposeOnOutsideClick: true
      });
    this.additionalOverlay = this.portalService.createPortalTemplate(this.additionalUsers, config, this.viewContainerRef);

    this.additionalOverlay.detachments().subscribe(this.additionalOverlay = null);
  }

  ngOnDestroy(): void {
    this.additionalOverlay?.dispose();
  }


}
