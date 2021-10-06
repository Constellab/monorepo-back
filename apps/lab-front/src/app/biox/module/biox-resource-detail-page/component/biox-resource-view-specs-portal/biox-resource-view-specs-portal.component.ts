import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {BioxResourceViewSpecsByType} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {FlOverlayRef} from '@monorepo/front-core-lib';
import {BioxResourceDetailPageState} from '../../state/biox-resource-detail-page.state';

/**
 * Portal to list the view specs of a resource and possibility to select one
 */
@Component({
  selector: 'gen-biox-resource-view-spec-portal',
  templateUrl: './biox-resource-view-specs-portal.component.html',
  styleUrls: ['./biox-resource-view-specs-portal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxResourceViewSpecsPortalComponent implements OnInit {

  views$: Observable<BioxResourceViewSpecsByType[]>;

  constructor(private overlayRef: FlOverlayRef,
              private state: BioxResourceDetailPageState) {
  }

  ngOnInit(): void {
    this.views$ = this.state.getViewSpecs$();
  }


  closeOverlay(): void {
    this.overlayRef.dispose();
  }

}
