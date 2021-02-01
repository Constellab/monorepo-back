import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {BioxResource} from '../../../../model/entities/biox-resource.entity';
import {Observable} from 'rxjs';

@Component({
  selector: 'gen-biox-resource-dialog',
  templateUrl: './biox-resource-dialog.component.html',
  styleUrls: ['./biox-resource-dialog.component.scss']
})
export class BioxResourceDialogComponent implements OnInit {

  resource: BioxResource;

  constructor(@Inject(MAT_DIALOG_DATA) input: BioxResource | Observable<BioxResource>) {
    if (input instanceof Observable) {
      input.subscribe(
        resources => this.resource = resources
      );
    } else {
      this.resource = input;
    }
  }

  ngOnInit(): void {
  }

}
