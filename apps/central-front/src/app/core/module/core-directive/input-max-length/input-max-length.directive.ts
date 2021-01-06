import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {TooltipService} from '../../../service/tooltip.service';
import {PortalDefaultPosition} from '../../../model/global/portal/portal.class';
import {HelpService} from '../../../utils/help-service';

/**
 * Directive to be placed in a input or a textarea to limit the length of it and if the user reached
 * the limit, it display a quick tooltip to warn the user that the limit has been reached
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[genInputMaxLength], textarea[genInputMaxLength]',
  providers: [TooltipService]
})
export class InputMaxLengthDirective implements OnInit, OnDestroy {

  /**
   * Max length of the input
   */
  @Input() set genInputMaxLength(length: number | string) {
    this.setInputMaxLength(length);
  }

  /**
   * Duration for the tooltip that show the warnings
   */
  @Input('genInputMaxLengthDuration') duration: number = 2000;

  /**
   * Position of the tooltip relative to the input
   */
  @Input('genInputMaxLengthPosition') position: PortalDefaultPosition = 'right';


  private keyUpListener: () => void;

  constructor(private elementRef: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
              private renderer: Renderer2,
              private tooltipService: TooltipService) {
  }

  ngOnInit(): void {
    this.keyUpListener = this.renderer.listen(this.elementRef.nativeElement, 'keyup',
      () => this.onInputChange());
  }

  // convert max length to number and set it
  private setInputMaxLength(length: number | string): void {
    const maxLength: number = HelpService.convertStringOrNumberToNumber(length, -1);

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
      'genInputMaxLength', this.duration,
      {param: {count: this.elementRef.nativeElement.maxLength}});
  }


  ngOnDestroy(): void {
    if (this.keyUpListener) {
      this.keyUpListener();
    }
  }

}
