import {Directive, Input, OnInit} from '@angular/core';
import {first} from 'rxjs/operators';
import {QuillEditorComponent} from 'ngx-quill';
import {ClHelpService} from '@monorepo/core-lib';
import {FlQuillConfig} from './fl-quill-config';

/**
 * Directive to configure the default config for quill
 *
 * It uses the default toolbar config and it enable the mention to search on users
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'quill-editor[flQuillConfig]'
})
export class FlQuillConfigDirective implements OnInit {

  @Input() disableMention: boolean = false;

  /**
   * Autofocus the quill editor
   */
  @Input() set pegQuillAutofocus(autofocus: boolean) {
    autofocus = ClHelpService.coerceBooleanOrEmptyProperty(autofocus);
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
      toolbar: FlQuillConfig.defaultToolbarConfig,
    };
  }

}
