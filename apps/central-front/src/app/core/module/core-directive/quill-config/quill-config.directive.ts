import {Directive, Input, OnInit} from '@angular/core';
import {first} from 'rxjs/operators';
import {HelpService} from '../../../utils/help-service';
import {QuillEditorComponent} from 'ngx-quill';
import {QuillConfig} from '../../../model/config/quill-config';

/**
 * Directive to configure the default config for quill
 *
 * It uses the default toolbar config and it enable the mention to search on users
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'quill-editor[genQuillConfig]'
})
export class QuillConfigDirective implements OnInit {

  @Input() disableMention: boolean = false;

  /**
   * Autofocus the quill editor
   */
  @Input() set pegQuillAutofocus(autofocus: boolean) {
    autofocus = HelpService.coerceBooleanOrEmptyProperty(autofocus);
    if (autofocus) {
      this.quillEditorComponent.onEditorCreated.pipe(first()).subscribe(
        editor => editor.focus()
      );

    }
  }

  constructor(private quillEditorComponent: QuillEditorComponent) {
  }

  ngOnInit(): void {
    // set the config on the quill component
    this.quillEditorComponent.modules = {
      toolbar: QuillConfig.defaultToolbarConfig,
    };
  }

}
