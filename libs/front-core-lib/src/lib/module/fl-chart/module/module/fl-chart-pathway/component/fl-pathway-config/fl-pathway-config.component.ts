import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlPathwayState} from '../../state/fl-pathway.state';
import {SelectionModel} from '@angular/cdk/collections';
import {FlPathwayDatabase, flPathwayDatabases, FlPathwayReactionPathwayDetail} from '../../model/fl-pathway.class';
import {debounceTime} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MatSelectChange} from '@angular/material/select';

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

  database: FlPathwayDatabase;

  subPathways: Observable<FlPathwayReactionPathwayDetail[]>;

  // handle the selection per id
  selection: SelectionModel<string>;

  pathwayDatabases: FlPathwayDatabase[] = flPathwayDatabases;

  constructor(private state: FlPathwayState) {
  }

  ngOnInit(): void {
    this.database = this.state.getDatabase();
    this.subPathways = this.state.getPathwayList$();
    // init the selection with current selected pathway
    this.selection = new SelectionModel(true, this.state.getSelectedPathwayIds());

    this.selection.changed.pipe(
      // use a debounce time to prevent rebuilding the graph to much
      debounceTime(500)
    ).subscribe(
      () => this.onSelectionChange()
    );
  }

  onDatabaseChange(change: MatSelectChange): void {
    this.state.selectDatabase(change.value);
  }

  private onSelectionChange(): void {
    this.state.selectPathways(this.selection.selected);
  }

}
