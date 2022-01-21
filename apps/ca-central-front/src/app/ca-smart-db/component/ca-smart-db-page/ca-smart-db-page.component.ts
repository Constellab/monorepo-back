import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CaSmartDbService} from '../../service/ca-smart-db.service';
import {CaSmartDbDocDatasource} from '../../model/ca-document.class';
import {CaSmartDbPageState} from '../../ca-smart-db-page.state';

@Component({
  selector: 'ca-smart-db-page',
  templateUrl: './ca-smart-db-page.component.html',
  styleUrls: ['./ca-smart-db-page.component.scss'],
  providers: [CaSmartDbPageState]
})
export class CaSmartDbPageComponent implements OnInit {

  formControl: FormControl;

  datasource: CaSmartDbDocDatasource;

  constructor(private smartDbService: CaSmartDbService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl(null);
    this.datasource = new CaSmartDbDocDatasource((page, pageSize, search: string) => this.smartDbService.search(search, page, pageSize));
  }

  submit(): void {
    const value: string = this.formControl.value;
    if (value == null || value.length === 0) return;

    this.search(value);
  }

  private search(searchText: string): void {
    this.datasource.getFirstPage(searchText);
  }
}
