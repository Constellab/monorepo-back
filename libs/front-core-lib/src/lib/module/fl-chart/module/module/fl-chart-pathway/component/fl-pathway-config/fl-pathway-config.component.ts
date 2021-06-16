import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlPathwayState} from '../../state/fl-pathway.state';
import {SelectionModel} from '@angular/cdk/collections';
import {FlPathwayReactionPathwayDetail} from '../../model/fl-pathway.class';
import {debounceTime} from 'rxjs/operators';

/**
 * Component to select the config of the pathway before showing it
 */
@Component({
  selector: 'fl-pathway-config',
  templateUrl: './fl-pathway-config.component.html',
  styleUrls: ['./fl-pathway-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPathwayConfigComponent implements OnInit {

  subPathways: FlPathwayReactionPathwayDetail[];

  // handle the selection per id
  selection: SelectionModel<string>;

  constructor(private state: FlPathwayState) {
  }

  ngOnInit(): void {
    this.subPathways = this.state.getPathwayList();
    // init the selection with current selected pathway
    this.selection = new SelectionModel(true, this.state.getSelectedPathwayIds());

    this.selection.changed.pipe(
      // use a debounce time to prevent rebuilding the graph to much
      debounceTime(500)
    ).subscribe(
      () => this.onSelectionChange()
    );
  }

  private onSelectionChange(): void {
    this.state.selectPathways(this.selection.selected);
  }

}
