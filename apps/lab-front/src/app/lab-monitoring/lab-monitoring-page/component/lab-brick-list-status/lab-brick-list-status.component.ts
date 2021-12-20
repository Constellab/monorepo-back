import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabBrickEntity} from '../../../../lab-core/model/entities/lab-brick.entity';
import {LabBrickService} from '../../../../lab-core/entity-service/lab-brick.service';

@Component({
  selector: 'lab-brick-list-status',
  templateUrl: './lab-brick-list-status.component.html',
  styleUrls: ['./lab-brick-list-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabBrickListStatusComponent implements OnInit {

  bricks$: Observable<LabBrickEntity[]>

  constructor(private brickService: LabBrickService) { }

  ngOnInit(): void {
    this.bricks$ = this.brickService.getAllBricks();
  }

}
