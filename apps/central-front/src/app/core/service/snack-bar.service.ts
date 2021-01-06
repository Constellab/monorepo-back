import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material/snack-bar';
import {ComponentType} from '@angular/cdk/overlay';
import {SnackBarInfoComponent} from '../module/core-component/component/snack-bar-info/snack-bar-info.component';
import {SnackBarInfoInput} from '../model/global/snack-bar.class';
import {CoreTranslateService} from '../module/translate/service/core-translate.service';

/**
 * Snack bar service to create snack bar
 */
@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private matSnackBar: MatSnackBar,
              private translateService: CoreTranslateService) {
  }


  /**
   * Show a success snack bar message (primary color)
   * @param message the message to display (supports HTML)
   * @param translate if true the text is translated
   * @param duration the duration in millisecond of the snackbar
   * @param showCloseButton if true a close button is shown in the snackbar
   */
  public openSuccessMessage(message: string, translate: boolean = false, duration: number = 3000,
                            showCloseButton: boolean = true)
    : MatSnackBarRef<SnackBarInfoComponent> {
    let msg: string;
    if (translate) {
      msg = this.translateService.translate(message);
    } else {
      msg = message;
    }

    return this.openSnackBarInfo({
      mode: 'success',
      text: msg,
      showCloseButton: showCloseButton,
    }, 'g-primary-background', duration);
  }

  /**
   * Show a error snack bar message (warn color)
   * @param message the message to display (supports HTML)
   * @param translate if true the text is translated
   * @param duration the duration in millisecond of the snackbar
   * @param showCloseButton if true, a close button is shown in the snackbar
   * @param showContactSupportText if true, show a text to contact the support
   */
  public openErrorMessage(message: string, translate: boolean = false, duration: number = 3000,
                          showCloseButton: boolean = true, showContactSupportText: boolean = false)
    : MatSnackBarRef<SnackBarInfoComponent> {
    let msg: string;
    if (translate) {
      msg = this.translateService.translate(message);
    } else {
      msg = message;
    }

    return this.openSnackBarInfo({
        mode: 'error',
        text: msg,
        showCloseButton: showCloseButton,
      },
      'g-warn-background',
      duration
    );
  }

  private openSnackBarInfo(data: SnackBarInfoInput, panelClass: string, duration: number)
    : MatSnackBarRef<SnackBarInfoComponent> {
    return this.openSnackBar(SnackBarInfoComponent, {
      data: data,
      duration: duration,
      panelClass: panelClass
    });
  }

  /**
   * Open a snack bar
   * @param component the component to attach to the snack bar
   * @param config the snack bar config
   */
  public openSnackBar<T = any>(component: ComponentType<T>,
                               config: MatSnackBarConfig = {}): MatSnackBarRef<T> {
    return this.matSnackBar.openFromComponent(component, config);
  }
}
