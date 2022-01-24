import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaSmartDbDoc} from '../../../model/ca-document.class';
import {CaSmartDbService} from '../../../service/ca-smart-db.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ca-smart-db-doc-page',
  templateUrl: './ca-smart-db-doc-page.component.html',
  styleUrls: ['./ca-smart-db-doc-page.component.scss']
})
export class CaSmartDbDocPageComponent implements OnInit {

  doc$: Observable<CaSmartDbDoc>;

  constructor(private route: ActivatedRoute,
              private smartDbService: CaSmartDbService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(id: string): void {
    this.doc$ = this.smartDbService.findById(id);
  }

}
