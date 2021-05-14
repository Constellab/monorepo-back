import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Renderer2,
  Self
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {Subscription} from 'rxjs';
import {FlFormFieldDirective} from '../../abstract-directive/form/fl-form-field.directive';
import {FlFormFieldMultipleDirective} from '../../abstract-directive/form/fl-form-field-multiple.directive';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Directive of an input that supports form controls to manage input file.
 *
 * Only works on input with the attribute type=file
 *
 * Must be inside a {@link FlInputFileContainerComponent}
 *
 * Supports multiple
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[flInputFile][type=file]',
  providers: [{provide: FlFormFieldDirective, useExisting: FlInputFileDirective}]
})
export class FlInputFileDirective extends FlFormFieldMultipleDirective<File>
  implements OnInit, ControlValueAccessor, OnDestroy {

  private subscription: Subscription;

  /**
   * NgModel change event
   */
  @Output() fileChange: EventEmitter<File | File[]> = new EventEmitter<File | File[]>();

  /**
   * If true, the directive only accept the file types listed in the accepted attribute
   */
  @Input() strictMode: boolean = true;


  /**
   *  @ignore
   *  call when a file is added
   */
  @HostListener('change')
  onMouseLeave(): void {
    this.fileChanged(this.elementRef.nativeElement.files);
  }


  constructor(private elementRef: ElementRef<HTMLInputElement>,
              private renderer: Renderer2,
              @Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }


  ngOnInit(): void {
    this.elementRef.nativeElement.multiple = this.multiple;
  }

  // when a file is added or changed
  public fileChanged(fileList: FileList): void {
    const files: File[] = ClHelpService.convertFileListToArray(fileList);

    if (this.strictMode) {
      // if we are in strict mode we filter the files
      this.addOrReplaceValue(this.filterInputFiles(files));
    } else {
      this.addOrReplaceValue(files);
    }

    this.emitCurrentValue();
    this.markAsTouched();
  }

  // change local value
  writeValue(obj: File | File[]): void {
    this.value = obj;

    if (!obj) {
      this.clearInput(false);
    } else {
      this.fileChange.emit(obj);
    }
  }

  callChangeEvent(value: File[] | File): void {
    this.fileChange.emit(value);
  }

  // handle disable
  onDisableChange(disable: boolean): void {
    // use setTimeout to let time for the parent to be set
    setTimeout(() => {
      if (disable) {
        // add disable class to the parent to style label
        this.renderer.addClass(this.elementRef.nativeElement.parentElement,
          'fl-input-file-container-disabled');
      } else {
        this.renderer.removeClass(this.elementRef.nativeElement.parentElement,
          'fl-input-file-container-disabled');
      }
    }, 0);
  }

  // clear the input and send data back
  public clearInput(emitEvent: boolean): void {
    if (!this.disabled) {
      this.elementRef.nativeElement.value = '';
      this.clearValue();
      if (emitEvent) {
        this.emitCurrentValue();
      }
    }
  }

  // filter the input based on the accept attribute
  private filterInputFiles(files: File[]): File[] {
    const acceptList: string[] = this.getAcceptAttribute();
    if (acceptList.length === 0) {
      return files;
    }

    const filteredFiles: File[] = [];
    for (const file of files) {
      for (const accept of acceptList) {
        // check if the file type contains one of the accepted type
        if (file.type.indexOf(accept) !== -1) {
          filteredFiles.push(file);
          break;
        }
      }
    }

    return filteredFiles;
  }

  private getAcceptAttribute(): string[] {
    // remove the '*' to compare the types
    return this.elementRef.nativeElement.accept.replace('*', '').split(',');
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
