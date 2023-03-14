import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {Observable} from 'rxjs';
import {LabUser} from '../../../../model/entities/lab-user.entity';
import {LabUserService} from '../../../../entity-service/lab-user.service';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'lab-user-select-options',
  templateUrl: './lab-user-select-options.component.html',
  styleUrls: ['./lab-user-select-options.component.scss']
})
export class LabUserSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  users$: Observable<LabUser[]>;

  constructor(@Host() @Optional() private select: MatSelect,
              private userService: LabUserService) {
    super(select);
  }

  ngOnInit(): void {
    this.users$ = this.userService.getAllUsers();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
