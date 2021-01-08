import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material/snack-bar';
import {ComponentType} from '@angular/cdk/overlay';
import {FlSnackBarInfoInput} from './model/fl-snack-bar.class';
import {FlSnackBarInfoComponent} from '../module/fl-core-component/component/fl-snack-bar-info/fl-snack-bar-info.component';
import {FlTranslateService} from '../module/fl-translate/service/fl-translate.service';

/**
 * Snack bar service to create snack bar
 */
@Injectable({
  providedIn: 'root'
})
export class FlSnackBarService {

  constructor(private matSnackBar: MatSnackBar,
              private translateService: FlTranslateService) {
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
    : MatSnackBarRef<FlSnackBarInfoComponent> {
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
   */
  public openErrorMessage(message: string, translate: boolean = false, duration: number = 3000,
                          showCloseButton: boolean = true)
    : MatSnackBarRef<FlSnackBarInfoComponent> {
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

  private openSnackBarInfo(data: FlSnackBarInfoInput, panelClass: string, duration: number)
    : MatSnackBarRef<FlSnackBarInfoComponent> {
    return this.openSnackBar(FlSnackBarInfoComponent, {
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
