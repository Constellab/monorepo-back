import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FlAbstractLoaderDirective} from '../fl-abstract-loader.directive';
import {Observable, Subscription} from 'rxjs';
import {ClNumberHelper} from '@monorepo/core-lib';

/**
 * Determine loader component that show the progress as percent in a progress spinner
 */
@Component({
  selector: 'fl-progress-loader',
  templateUrl: './fl-progress-loader.component.html',
  styleUrls: ['./fl-progress-loader.component.scss']
})
export class FlProgressLoaderComponent extends FlAbstractLoaderDirective implements OnInit, OnDestroy {

  @Input() set percent(percent: number | Observable<number>) {
    this.unsubscribe();

    if (percent == null) {
      this.loaderValue = 0;
      return;
    }

    if (typeof percent === 'number') {
      this.setValue(percent);
    } else {
      percent.subscribe(
        val => this.setValue(val)
      );
    }
  }

  @Input() fontSize: number;

  // value to show
  loaderValue: number = 0;

  private subscription: Subscription;

  ngOnInit(): void {
    if (this.fontSize == null) {
      this.fontSize = this.getAutoFontSize();
    }

  }

  private getAutoFontSize(): number {
    switch (this.size) {
      case 'small':
        return 10;
      case 'medium':
        return 15;
      case 'large':
        return 25;
      case 'extra-large':
        return 35;
      default:
        return 15;
    }
  }

  private setValue(value: number): void {
    this.loaderValue = ClNumberHelper.between(value, 0, 100);
  }

  private unsubscribe(): void {
    this.subscription?.unsubscribe();
  }


  ngOnDestroy(): void {
    this.unsubscribe();
  }

}
