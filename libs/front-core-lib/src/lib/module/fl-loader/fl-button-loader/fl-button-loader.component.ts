import {Component, ElementRef, Host, Input, OnDestroy, OnInit, Optional, Renderer2} from '@angular/core';
import {MatButton} from '@angular/material/button';

/**
 * Loader to be inserted in a button
 * It fits the size of material button
 */
@Component({
  selector: 'fl-button-loader',
  templateUrl: './fl-button-loader.component.html',
  styleUrls: ['./fl-button-loader.component.scss']
})
export class FlButtonLoaderComponent implements OnInit, OnDestroy {

  /**
   * Position of the loader in the button
   * If override, the button text is hidden during loading,
   *    the button text need to be wrapped in a span
   *
   *  Default to right in button and override in icon buttons
   */
  @Input() position: 'left' | 'right' | 'override';

  @Input() size: 'normal' | 'small' = 'normal';

  @Input() disabledButtonOnLoad: boolean = true;

  private readonly hideTextClass: string = 'g-button-hide-text';

  constructor(@Host() @Optional() private button: MatButton,
              private elementRef: ElementRef<HTMLElement>,
              private renderer2: Renderer2) {
  }

  ngOnInit(): void {
    if (this.position == null) {
      this.position = this.defaultPosition;
    }

    if (this.button && this.disabledButtonOnLoad) {
      this.button.disabled = true;
    }

    if (this.position === 'override') {
      this.renderer2.addClass(this.elementRef.nativeElement.parentElement, this.hideTextClass);
    }

  }

  get loaderSize(): number {
    if (this.size === 'small') {
      return 20;
    } else if (this.size === 'normal') {
      return 30;
    } else {
      console.error('[ButtonLoaderComponent] incorrect size');
      return 20;
    }
  }

  // return true if the button is an icon button
  private isIconButton(): boolean {
    return this.button?._elementRef.nativeElement.classList.contains('mat-icon-button') ?? false;
  }

  // default position
  private get defaultPosition(): 'left' | 'right' | 'override' {
    return this.isIconButton() ? 'override' : 'right';
  }


  ngOnDestroy(): void {
    if (this.button) {
      this.button.disabled = false;
    }

    if (this.position === 'override') {
      this.renderer2.removeClass(this.elementRef.nativeElement.parentElement, this.hideTextClass);
    }
  }


}
