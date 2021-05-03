import {Directive, SecurityContext} from '@angular/core';
import {QuillEditorComponent} from 'ngx-quill';
import {DomSanitizer} from '@angular/platform-browser';

/**
 * Special directive that is automatically attache to quill-editor component
 * This directive prevent xss error in quill-editor component by sanitizing the form value
 * before sending it to quill
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'quill-editor'
})
export class FlQuillSanitizerDirective {

  constructor(private quillEditorComponent: QuillEditorComponent,
              private sanitize: DomSanitizer) {
    this.overwriteWriteValue();
  }

  /**
   * Overwrite the quill editor write value to sanitize it before sending it to quill editor component
   * @private
   */
  private overwriteWriteValue(): void {
    const writeValue: (obj: any) => void = this.quillEditorComponent.writeValue;

    this.quillEditorComponent.writeValue = (obj: any): void => {
      // sanitize the object
      const sanitizedObject: string = this.sanitize.sanitize(SecurityContext.HTML,obj);
      // call the base write value method of quillEditor with quillEditorComponent context
      writeValue.bind(this.quillEditorComponent)(sanitizedObject);
    }

  }
}
