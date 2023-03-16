import {Injectable} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';
import {
  FlSnackBarAdditionalConfig,
  flSnackBarAdditionalConfigDefault,
  FlSnackBarInfoInput
} from './model/fl-snack-bar.class';
import {FlSnackBarInfoComponent} from './component/fl-snack-bar-info/fl-snack-bar-info.component';
import {FlTranslatableText} from '../fl-translate/model/fl-translate-param';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material/snack-bar';

/**
 * Snack bar service to create snack bar
 */
@Injectable()
export class FlSnackBarService {

  constructor(private matSnackBar: MatSnackBar) {
  }


  /**
   * Show a success snack bar message (primary color)
   * @param message the message to display (supports HTML)
   * @param duration the duration in millisecond of the snackbar
   * @param additionalConfig additional config
   */
  public openSuccessMessage(message: FlTranslatableText, duration: number = 3000,
                            additionalConfig: FlSnackBarAdditionalConfig = flSnackBarAdditionalConfigDefault)
    : MatSnackBarRef<FlSnackBarInfoComponent> {
    return this.openSnackBarInfo({
      mode: 'success',
      text: message,
      additionalConfig: additionalConfig,
    }, 'g-snackbar-primary', duration);
  }

  /**
   * Show a error snack bar message (warn color)
   * @param message the message to display (supports HTML)
   * @param duration the duration in millisecond of the snackbar
   * @param additionalConfig additional config
   */
  public openErrorMessage(message: FlTranslatableText, duration: number = null,
                          additionalConfig: FlSnackBarAdditionalConfig = flSnackBarAdditionalConfigDefault)
    : MatSnackBarRef<FlSnackBarInfoComponent> {
    return this.openSnackBarInfo({
      mode: 'error',
      text: message,
      additionalConfig: additionalConfig,
    }, 'g-snackbar-warn', duration);
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
