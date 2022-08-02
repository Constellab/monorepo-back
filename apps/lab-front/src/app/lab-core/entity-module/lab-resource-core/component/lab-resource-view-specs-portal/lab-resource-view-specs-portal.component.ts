import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FlOverlayRef} from '@monorepo/front-core-lib';
import {LabResourceViewState} from '../../state/lab-resource-view.state';
import {LabResourceViewSpecsByType} from '../../../../model/entities/resource/lab-resource-view-type.class';

/**
 * Portal to list the view specs of a resource and possibility to select one
 */
@Component({
  selector: 'lab-resource-view-spec-portal',
  templateUrl: './lab-resource-view-specs-portal.component.html',
  styleUrls: ['./lab-resource-view-specs-portal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabResourceViewSpecsPortalComponent implements OnInit {

  views$: Observable<LabResourceViewSpecsByType[]>;

  constructor(private overlayRef: FlOverlayRef,
              private state: LabResourceViewState) {
  }

  ngOnInit(): void {
    this.views$ = this.state.getViewSpecs$();
  }


  closeOverlay(): void {
    this.overlayRef.dispose();
  }

}
