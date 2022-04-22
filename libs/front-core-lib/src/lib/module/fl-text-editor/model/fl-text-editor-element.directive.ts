import {Directive, ElementRef} from '@angular/core';
import {FlTextEditorsManagerState} from '../state/fl-text-editors-manager.state';
import {FlTextEditorState} from '../state/fl-text-editor.state';
import {Observable} from 'rxjs';

/**
 * Parent class for component that are loaded inside the FlTextEditor
 */
@Directive()
export abstract class FlTextEditorElementDirective {

  protected state: FlTextEditorState;

  protected constructor(protected elementRef: ElementRef<HTMLElement>,
                        managersState: FlTextEditorsManagerState) {
    // retrieve the state of the text editor based on HTML element
    this.state = managersState.getState(elementRef.nativeElement);
  }

  protected getDisabled$(): Observable<boolean> {
    return this.state.getDisabled$();
  }

}
