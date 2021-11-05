import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabBrickEntity} from '../../../../core/model/entities/lab-brick.entity';
import {LabBrickService} from '../../../../core/entity-service/lab-brick.service';

@Component({
  selector: 'gen-lab-brick-list-status',
  templateUrl: './lab-brick-list-status.component.html',
  styleUrls: ['./lab-brick-list-status.component.scss']
})
export class LabBrickListStatusComponent implements OnInit {

  bricks$: Observable<LabBrickEntity[]>

  constructor(private brickService: LabBrickService) { }

  ngOnInit(): void {
    this.bricks$ = this.brickService.getAllBricks();
  }

}
