import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ca-project-settings',
  templateUrl: './ca-project-settings.component.html',
  styleUrls: ['./ca-project-settings.component.scss']
})
export class CaProjectSettingsComponent implements OnInit {

  // only allow storage setting for root projects
  showStorageSettings$: Observable<boolean> = this.state.getProject$().pipe(
    map(project => project.isRoot())
  );

  constructor(private state: CaProjectDetailState) { }

  ngOnInit(): void {
  }

}
