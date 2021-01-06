import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ComponentType} from '@angular/cdk/overlay';
import {Injectable, TemplateRef} from '@angular/core';
import {merge, Observable} from 'rxjs';
import {NavigationStart, Router} from '@angular/router';
import {filter, first, map} from 'rxjs/operators';
import {CorePlatformService} from './core-plateform.service';
import {ConfirmDialogInput} from '../model/global/confirm.dialog.class';
import {ConfirmDialogComponent} from '../module/core-component/component/confirm-dialog/confirm-dialog.component';

/**
 * Service to open responsive dialog. The max-height and width of the dialog
 * depend on the screen width.
 *
 * All the dialog open in fullscreen when the screen's width is smaller than 600px
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog, private platformService: CorePlatformService,
              private router: Router) {
  }

  /**
   * Open a big dialog
   *
   * Width = 80vw. Height = 95vh
   * @param componentOrTemplateRef component or template to use in dialog
   * @param config material configuration for the dialog
   * @return The dialog reference
   */
  public openBigDialog<T = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
                                config: MatDialogConfig = {}): MatDialogRef<T> {
    config.panelClass = 'g-big-dialog';

    config = this.manageSafariBrowser(config);

    return this.openDialog(componentOrTemplateRef, config);
  }

  /**
   * Open a huge dialog
   *
   * Width = 95vw. Height = 95vh
   * @param componentOrTemplateRef component or template to use in dialog
   * @param config material configuration for the dialog
   * @return The dialog reference
   */
  public openHugeDialog<T = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
                                 config: MatDialogConfig = {}): MatDialogRef<T> {
    config.panelClass = 'g-huge-dialog';

    config = this.manageSafariBrowser(config);

    return this.openDialog(componentOrTemplateRef, config);
  }

  /**
   * Open a medium size dialog
   *
   * When screen width > 1050px --> width = 50vw
   *
   * When screen width > 600px --> width = 80vw
   * @param componentOrTemplateRef component or template to use in dialog
   * @param config material configuration for the dialog
   * @return The dialog reference
   */
  public openMediumDialog<T = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
                                   config: MatDialogConfig = {}): MatDialogRef<T> {
    config.panelClass = 'g-medium-dialog';

    config = this.manageSafariBrowser(config);

    return this.openDialog(componentOrTemplateRef, config);
  }

  /**
   * Open a small dialog
   *
   * When screen width > 1050 px --> width = 30vw
   *
   * When screen width > 600 px --> width = 50vw
   * @param componentOrTemplateRef component or template to use in dialog
   * @param config material configuration for the dialog
   * @return The dialog reference
   */
  public openSmallDialog<T = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
                                  config: MatDialogConfig = {}): MatDialogRef<T> {
    config.panelClass = 'g-small-dialog';


    config = this.manageSafariBrowser(config);

    return this.openDialog(componentOrTemplateRef, config);
  }

  /**
   * Open a full screen dialog
   * @param componentOrTemplateRef component or template to use in dialog
   * @param config material configuration for the dialog
   * @return The dialog reference
   */
  public openFullDialog<T = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
                                 config: MatDialogConfig = {}): MatDialogRef<T> {
    config.panelClass = 'g-full-dialog';

    config = this.manageSafariBrowser(config, false);

    return this.openDialog(componentOrTemplateRef, config);
  }

  /**
   * Open a confirm dialog ( a simple dialog with a 'Yes' and 'No' button
   * @param input Title of the dialog, supports HTML
   * when the user press 'Yes' and the dialog is can't be closed until
   * the observable completes. The dialog returns the observable result
   *
   * @return return a MatDialogRef, the dialog returns a {@link ConfirmDialogResult}
   */
  public openConfirmDialog(input: ConfirmDialogInput)
    : MatDialogRef<ConfirmDialogComponent> {

    // disable close to handle it in the dialog
    return this.openSmallDialog(ConfirmDialogComponent, {data: input, disableClose: true});
  }

  // open the dialog
  private openDialog<T = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
                              config: MatDialogConfig): MatDialogRef<T> {

    const dialogRef: MatDialogRef<T> = this.dialog.open(componentOrTemplateRef, config);

    // manage the dialog closing
    this.manageDialogClosing(config, dialogRef);

    return dialogRef;
  }

  // handle the full screen dialog on safari browser
  // this is because of the safari toolbar not include in the screen size
  private manageSafariBrowser(config: MatDialogConfig, checkInnerWidth: boolean = true): MatDialogConfig {

    // if the browser is safari
    if (this.platformService.isSafari()) {
      // is the screen size is lower than 600 -> fullscreen (define by the classes)
      if (!checkInnerWidth || window.innerWidth < 600) {
        config.maxHeight = window.innerHeight + 'px';
        config.height = window.innerHeight + 'px';
      }
    }

    return config;
  }

  // function to manage the dialog close, including improve the closeOnNavigation option
  private manageDialogClosing(config: MatDialogConfig, dialogRef: MatDialogRef<any>): void {

    if (config.closeOnNavigation) {

      const obs$: Observable<boolean>[] = [];

      // unsubscribe when the dialog is closed is disposed (thank to the false)
      obs$.push(dialogRef.afterClosed().pipe(map(() => false)));


      // get the router events
      obs$.push(this.router.events.pipe(
        // only trigger on Navigation start
        filter(value => value instanceof NavigationStart),
        // set response to true to close the dialog
        map(() => true))
      );

      // merge events and unsubscribe on the first emission
      merge(...obs$).pipe(first()).subscribe((val) => {
        // if we received a true --> close the dialog
        if (val) {
          dialogRef.close();
        }
      });
    }
  }

  /**
   * Return true if some dialog are open
   */
  public hasOpenedDialog(): boolean {
    return this.dialog.openDialogs.length > 0;
  }

  /**
   * Return the number of opened dialog
   */
  public numberOfOpenedDialog(): number {
    return this.dialog.openDialogs.length;
  }

  /**
   * Subscribe to event when all the dialog are closed
   */
  public afterAllClosed(): Observable<void> {
    return this.dialog.afterAllClosed;
  }
}
