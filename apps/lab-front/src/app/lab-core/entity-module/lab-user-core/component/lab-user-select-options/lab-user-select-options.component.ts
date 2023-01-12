import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {Observable} from 'rxjs';
import {LabUser} from '../../../../model/entities/lab-user.entity';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';
import {LabUserService} from '../../../../entity-service/lab-user.service';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

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
