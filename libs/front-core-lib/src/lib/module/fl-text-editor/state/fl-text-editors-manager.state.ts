import {Injectable} from '@angular/core';
import {FlTextEditorState} from './fl-text-editor.state';
import {FlHtmlHelper} from '../../../utils/fl-html.helper';


interface FlTextEditorStateStore {
  editorElement: HTMLElement;
  state: FlTextEditorState;
}

/**
 * Global state to store all the state of the existing FlTextEditorComponent,
 * useful to retrieve state inside subcomponents
 */
@Injectable({providedIn: 'root'})
export class FlTextEditorsManagerState {

  private states: FlTextEditorStateStore[] = [];

  constructor() {
  }

  public registerTextEditor(parentElement: HTMLElement, state: FlTextEditorState): void {

    // check if the state was already registered
    const existingState = this.findStateByParent(parentElement);
    if (existingState != null) return;

    this.states.push({
      editorElement: parentElement,
      state: state
    });
  }

  public unregisterTextEditor(parentElement: HTMLElement): void {
    // remove the state from the list
    const index = this.states.findIndex(state => state.editorElement === parentElement);

    if (index >= 0) {
      this.states.splice(index, 1);
    }
  }

  public getState(element: HTMLElement): FlTextEditorState | null {
    const parentElement = FlHtmlHelper.getParent(element, {className: 'text-editor'});

    if (parentElement == null) {
      return null;
    }

    return this.findStateByParent(parentElement);
  }

  private findStateByParent(parentElement: HTMLElement): FlTextEditorState | null {
    return this.states.find(state => state.editorElement === parentElement)?.state ?? null;
  }
}
