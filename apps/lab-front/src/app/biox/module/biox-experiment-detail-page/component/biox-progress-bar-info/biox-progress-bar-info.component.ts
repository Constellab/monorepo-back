import {Component, Input, OnInit} from '@angular/core';
import {BioxProgressBar} from '../../../../../core/model/entities/biox-progress-bar.entity';

/**
 * Show information about a {@link BioxProgressBar}
 */
@Component({
  selector: 'gen-biox-progress-bar-info',
  templateUrl: './biox-progress-bar-info.component.html',
  styleUrls: ['./biox-progress-bar-info.component.scss']
})
export class BioxProgressBarInfoComponent implements OnInit {

  @Input() progressBar: BioxProgressBar;

  constructor() {
  }

  ngOnInit(): void {
  }

}
