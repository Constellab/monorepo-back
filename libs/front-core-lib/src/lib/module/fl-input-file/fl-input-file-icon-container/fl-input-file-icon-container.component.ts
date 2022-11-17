import {Component, ContentChild, ElementRef, Input, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {FlInputFileDirective} from '../fl-input-file.directive';

/**
 * Component to style the input file using only an icon button
 *
 * Must have a input child with the {@link FlInputFileDirective} directive to correctly work
 *
 * Supports theme color palette
 *
 * @example
 * <fl-input-file-icon-container color="primary" icon="upload_file">
 *  <input flInputFile multiple type="file" required [strictMode]="true"
 *         formControlName="file" accept="application/pdf">
 * </fl-input-file-icon-container>
 */
@Component({
  selector: 'fl-input-file-icon-container',
  templateUrl: './fl-input-file-icon-container.component.html',
  styleUrls: ['./fl-input-file-icon-container.component.scss']
})
export class FlInputFileIconContainerComponent implements OnInit {

  @Input() icon: string;

  @Input() color: ThemePalette;

  @Input() border: boolean = false;

  @Input() disabled: boolean = false;

  @Input() size: 'normal' | 'small' = 'normal';

  // retrieve the injected directive in the ng content
  @ContentChild(FlInputFileDirective, {static: true, read: ElementRef}) private inputFile: ElementRef<HTMLInputElement>;

  constructor() {
  }

  ngOnInit(): void {
  }

  openFileExplorer(): void {
    this.inputFile.nativeElement.click();
  }
}
