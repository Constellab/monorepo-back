import {Component, OnInit} from '@angular/core';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';
import {HaBrick} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';

@Component({
  selector: 'ha-public-edit-brick-page',
  templateUrl: './ha-public-edit-brick-page.component.html',
  styleUrls: ['./ha-public-edit-brick-page.component.scss']
})
export class HaPublicEditBrickPageComponent implements OnInit {

  brick: HaBrick;
  loaded = false;

  constructor(
    private brickService: HaBrickService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params.brickId)
        this.getBrick(params.brickId);
      else {
        this.loaded = true;
      }
    });

  }

  private getBrick(id: string): void{
    this.brickService.getById(id).subscribe(brick => {
      this.brick = brick;
    })
  }

}
