import {Component, Input, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/project/ca-experiment.class';
import {FlTextEditorBasicConfig, FlTextEditorConfig} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-experiment-info',
  templateUrl: './ca-experiment-info.component.html',
  styleUrls: ['./ca-experiment-info.component.scss']
})
export class CaExperimentInfoComponent implements OnInit {

  @Input() experiment: CaExperiment;

  textEditorConfig: FlTextEditorConfig = new FlTextEditorBasicConfig();

  constructor() { }

  ngOnInit(): void {
  }

}
