import {Component, Input, OnInit} from '@angular/core';
import {Observable, switchMap} from 'rxjs';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaUser} from '../../../../../ca-core/model/entities/ca-user.class';
import {map} from 'rxjs/operators';

/**
 * Component to list the users that have access to a project
 */
@Component({
  selector: 'ca-project-users',
  templateUrl: './ca-project-users.component.html',
  styleUrls: ['./ca-project-users.component.scss']
})
export class CaProjectUsersComponent implements OnInit {

  @Input() projectId$: Observable<string>;

  users$: Observable<CaUser[]>;

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.users$ = this.projectId$.pipe(
      switchMap(id => this.projectService.getUsersOfProject(id)),
    ).pipe(
      map(users => [...users, ...users, ...users, ...users])
    );
  }

}
