import {Component, OnInit} from '@angular/core';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxResourceVM} from '../../../../../core/model/entities/biox-resource.entity';

@Component({
  selector: 'gen-biox-resource-detail-page',
  templateUrl: './biox-resource-detail-page.component.html',
  styleUrls: ['./biox-resource-detail-page.component.scss']
})
export class BioxResourceDetailPageComponent implements OnInit {

  resource$: Observable<BioxResourceVM>;

  constructor(private resourceService: BioxResourceService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(id: string): void {
    this.resource$ = this.resourceService.getById(id);
  }

}
