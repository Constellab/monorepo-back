import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {CaUser, CaUserDatasourcePaginated} from '../../../../model/entities/ca-user.class';
import {FlFormFieldDirective, FlOverlayRef, FlPortalConnectedPosition, FlPortalService} from '@monorepo/front-core-lib';
import {NgControl} from '@angular/forms';

interface UserList {
  previewUsers: CaUserSelection[];
  additionalUsers: CaUserSelection[];
}

interface CaUserSelection {
  user: CaUser;
  selected: boolean;
}

/**
 * Show a condensed list of user in one line.
 * This component supports form and return the list of selected users.
 * It supports datasource or list of user
 */
@Component({
  selector: 'ca-user-list-inline',
  templateUrl: './ca-user-list-inline.component.html',
  styleUrls: ['./ca-user-list-inline.component.scss']
})
export class CaUserListInlineComponent extends FlFormFieldDirective<UserList, CaUser[]>
  implements OnInit, OnDestroy {

  @Input() users$: Observable<CaUser[]>;

  @Input() userDatasource: CaUserDatasourcePaginated;

  @Input() previewListSize: number = 6;

  @Output() selectionChange: EventEmitter<CaUser[]> = new EventEmitter();

  @ViewChild('additionalUsers', {static: false}) additionalUsers: TemplateRef<unknown>;


  additionalUserLength: number;

  // use to store the selected user before the user list is loaded
  private tempSelectedUser: CaUser[] = [];
  private additionalOverlay: FlOverlayRef;

  private subscription: Subscription;

  constructor(@Optional() @Self() ngControl: NgControl,
              private portalService: FlPortalService,
              private viewContainerRef: ViewContainerRef) {
    super(ngControl);
  }

  ngOnInit(): void {
    if (this.userDatasource) {
      this.subscription = this.userDatasource.connect().subscribe(
        users => this.onUserLoaded(users)
      );
    } else {
      this.subscription = this.users$.subscribe(
        users => this.onUserLoaded(users)
      );
    }
  }

  private onUserLoaded(users: CaUser[]): void {
    this.value = {
      // slice the array to limit preview and reverse it as it is reverse in the html
      previewUsers: this.usersToUserSelection(users.slice(0, this.previewListSize).reverse()),
      additionalUsers: this.usersToUserSelection(users.slice(this.previewListSize))
    };

    // calculate the number of additional user
    if (this.userDatasource) {
      this.additionalUserLength = this.userDatasource.page.totalElements - this.previewListSize;
    } else {
      this.additionalUserLength = this.value.additionalUsers.length - this.previewListSize;
    }

    if (this.tempSelectedUser.length > 0) {
      this.selectUsers(this.tempSelectedUser);
    }
  }

  callChangeEvent(value: CaUser[]): void {
    this.selectionChange.emit(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: CaUser[]): void {
    this.selectUsers(obj);
  }

  protected convertInnerToOuter(innerValue: UserList): CaUser[] {
    return innerValue.previewUsers.concat(innerValue.additionalUsers)
      .filter(userSelection => userSelection.selected)
      .map(userSelection => userSelection.user);
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
        disposeOnOutsideClick: true
      });
    this.additionalOverlay = this.portalService.createPortalTemplate(this.additionalUsers, config, this.viewContainerRef);

    this.additionalOverlay.detachments().subscribe(() => this.additionalOverlay = null);
  }

  private usersToUserSelection(users: CaUser[]): CaUserSelection[] {
    return users.map(user => ({user: user, selected: false}));
  }

  private selectUsers(users: CaUser[]): void {
    this.tempSelectedUser = users;

    if (this.value) {
      // update the selected parameter of the user list
      [...this.value.previewUsers, ...this.value.additionalUsers].forEach(userSelection =>
        userSelection.selected = users.find(selectedUser => selectedUser.id === userSelection.user.id) != null);
    }
  }

  selectUser(userSelection: CaUserSelection): void {
    if (this.disabled) return;
    userSelection.selected = !userSelection.selected;

    this.emitCurrentValue();
  }

  // return true if one of the additional user is selected
  selectionAdditionalUser(): boolean {
    if (this.additionalOverlay) return true;
    if (!this.value) return false;
    return this.value.additionalUsers.find(userSelection => userSelection.selected) != null;
  }

  ngOnDestroy(): void {
    this.additionalOverlay?.dispose();
    this.subscription?.unsubscribe();
  }


}
