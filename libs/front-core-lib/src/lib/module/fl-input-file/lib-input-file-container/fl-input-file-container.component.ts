import {AfterContentInit, Component, ContentChild, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {CanColor, mixinColor, ThemePalette} from '@angular/material/core';
import {FlInputFileDirective} from '../fl-input-file.directive';
import {NgControl} from '@angular/forms';
import {Subscription} from 'rxjs';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlDropFileEvent} from '../../fl-core-directive/fl-drag-hover/fl-drop-file-event.class';

/**
 * @internal
 * private class to manage the ThemePalette color
 */
class FlInputFileContainerComponentMixinBase {
  constructor(public _elementRef: ElementRef) {
  }
}


/**
 * @internal
 * private
 */
const _FlInputFileContainerComponentMixinBase =
  mixinColor(FlInputFileContainerComponentMixinBase);

/**
 * Component to style the input file
 *
 * Must have a input child with the {@link FlInputFileDirective} directive to correctly work
 *
 * Supports theme color palette
 *
 * @example
 * <fl-input-file-container color="primary" placeholder="Select multiple pdf files">
 *  <input flInputFile multiple type="file" required [strictMode]="true"
 *         formControlName="file" accept="application/pdf">
 *
 *         <mat-error *ngIf="formGroup.get('file').hasError('required')">
 *            File is required
 *         </mat-error>
 * </fl-input-file-container>
 *
 */
@Component({
  selector: 'fl-input-file-container',
  templateUrl: './fl-input-file-container.component.html',
  styleUrls: ['./fl-input-file-container.component.scss']
})
export class FlInputFileContainerComponent extends _FlInputFileContainerComponentMixinBase
  implements OnInit, CanColor, AfterContentInit, OnDestroy {


  /**
   * The theme color of the input
   */
  @Input() color: ThemePalette;

  /**
   * Default text displayed when no file selected
   */
  @Input() placeholder: string;

  /**
   * Icon show before the text
   */
  @Input() icon: string;

  /**
   * If true, it no possible to drop a file on input
   */
  @Input() disableFileDrop: boolean = false;

  // retrieve the injected directive in the ng content
  @ContentChild(FlInputFileDirective, {static: true}) private inputFile: FlInputFileDirective;

  // if the file is not null
  hasValue: boolean = false;

  // text to display inside the label
  placeholderText: string;

  // true if the control is required
  private isRequired: boolean = false;

  // subscription to control event
  private changeSubscription: Subscription;
  private stateSubscription: Subscription;

  constructor(elementRef: ElementRef, private translateService: FlTranslateService) {
    super(elementRef);
  }

  ngOnInit(): void {
    this.displayDefaultText();

    if (this.inputFile == null) {
      console.error('[FlInputFileContainer] The file input with the directive FlInputFile is missing');
    }

    this.changeSubscription = this.inputFile.fileChange.subscribe((file: File | File[]) => this.getNewFiles(file));
    this.refreshRequired();
  }

  ngAfterContentInit(): void {
    this.listenToControlChanges();
  }

  // listen to control change to display errors
  private listenToControlChanges(): void {
    const ngControl: NgControl = this.inputFile.ngControl;

    if (ngControl) {
      this.stateSubscription = ngControl.statusChanges.subscribe(
        () => {
          this.refreshRequired();
        }
      );
    }
  }

  // change displayed text on file input change
  private getNewFiles(files: File | File[]): void {
    if (files instanceof Array) {
      const length: number = files.length;
      if (length === 0) {
        this.displayDefaultText();
      } else if (length === 1) {
        this.hasValue = true;
        this.placeholderText = this.placeholderText = (files[0] as File).name;
      } else {
        this.hasValue = true;
        this.placeholderText = length + ' ' + this.translateService.translate('flFileInput.files');
      }
    } else {

      if (files == null) {
        this.displayDefaultText();
      } else {
        this.placeholderText = (files as File).name;
        this.hasValue = true;
      }
    }
  }

  private refreshRequired(): void {
    this.isRequired = this.inputFile.required;
    if (!this.hasValue) {
      this.displayDefaultText();
    }
  }

  // display the input placeholder as a text
  private displayDefaultText(): void {
    this.hasValue = false;

    if(this.placeholder != null){
      this.placeholderText = this.placeholder;
    }
    else{
      // use a default text
      this.placeholderText = this.inputFile.multiple ?
        this.translateService.translate('flFileInput.select_files') :
        this.translateService.translate('flFileInput.select_file');
    }

    if (this.isRequired) {
      this.placeholderText += ' *';
    }
  }

  // clear the file input
  clearInput(): void {
    if (!this.inputFile.disabled) {
      this.inputFile.clearInput(true);
    }
  }

  onDropFile(event: FlDropFileEvent): void {
    this.inputFile.fileChanged(event.event.dataTransfer.files);
  }

  // clear the subscription
  ngOnDestroy(): void {
    this.changeSubscription?.unsubscribe();
    this.stateSubscription?.unsubscribe();
  }

}
