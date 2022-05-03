import {Component, ElementRef, OnInit} from '@angular/core';
import {FlTextEditorElementDirective} from '../../model/fl-text-editor-element.directive';
import {FlTextEditorsManagerState} from '../../state/fl-text-editors-manager.state';

@Component({
  selector: 'fl-text-editor-hint',
  templateUrl: './fl-text-editor-hint.component.html',
  styleUrls: ['./fl-text-editor-hint.component.scss']
})
export class FlTextEditorHintComponent extends FlTextEditorElementDirective implements OnInit {

  constructor(elementRef: ElementRef<HTMLElement>,
              managersState: FlTextEditorsManagerState) {
    super(elementRef, managersState);
  }

  ngOnInit(): void {
  }

}
