import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';
import {FlTooltipService} from '../../fl-portal/service/fl-tooltip.service';
import {FlPortalDefaultPosition} from '../../fl-portal/model/fl-portal.class';

/**
 * Directive to be placed in a input or a textarea to limit the length of it and if the user reached
 * the limit, it display a quick tooltip to warn the user that the limit has been reached
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[flInputMaxLength], textarea[flInputMaxLength]',
  providers: [FlTooltipService]
})
export class FlInputMaxLengthDirective implements OnInit, OnDestroy {

  /**
   * Max length of the input
   */
  @Input() set flInputMaxLength(length: number | string) {
    this.setInputMaxLength(length);
  }

  /**
   * Duration for the tooltip that show the warnings
   */
  @Input('flInputMaxLengthDuration') duration: number = 2000;

  /**
   * Position of the tooltip relative to the input
   */
  @Input('flInputMaxLengthPosition') position: FlPortalDefaultPosition = 'right';


  private keyUpListener: () => void;

  constructor(private elementRef: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
              private renderer: Renderer2,
              private tooltipService: FlTooltipService) {
  }

  ngOnInit(): void {
    this.keyUpListener = this.renderer.listen(this.elementRef.nativeElement, 'keyup',
      () => this.onInputChange());
  }

  // convert max length to number and set it
  private setInputMaxLength(length: number | string): void {
    const maxLength: number = ClHelpService.convertStringOrNumberToNumber(length, -1);

    if (maxLength === -1) {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'maxlength');
    } else {
      this.elementRef.nativeElement.maxLength = maxLength;
    }
  }

  private onInputChange(): void {
    if (this.elementRef.nativeElement.maxLength !== -1 &&
      (this.elementRef.nativeElement.value?.length ?? 0) >= this.elementRef.nativeElement.maxLength) {
      this.openTooltipPortal();
    }
  }

  // open the portal if it doesn't already exist
  private openTooltipPortal(): void {
    this.tooltipService.openTooltipWithTranslate(this.elementRef, 'input_max_length', 'right',
      'flInputMaxLength', this.duration,
      {param: {count: this.elementRef.nativeElement.maxLength}});
  }


  ngOnDestroy(): void {
    if (this.keyUpListener) {
      this.keyUpListener();
    }
  }

}
