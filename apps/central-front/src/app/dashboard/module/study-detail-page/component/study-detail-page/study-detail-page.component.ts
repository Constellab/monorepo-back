import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Study} from '../../../../../core/model/entities/study.class';
import {StudyService} from '../../../../service/study.service';

/**
 * Detail page for a study
 */
@Component({
  selector: 'gen-study-detail-page',
  templateUrl: './study-detail-page.component.html',
  styleUrls: ['./study-detail-page.component.scss']
})
export class StudyDetailPageComponent implements OnInit {

  study: Study;

  isLoading: boolean = true;

  constructor(private route: ActivatedRoute,
              private studyService: StudyService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getStudy(params.studyId)
    );
  }

  private getStudy(id: string): void {
    this.isLoading = true;
    this.studyService.findById(id).subscribe(
      study => this.getSuccess(study),
      () => this.isLoading = false
    );
  }

  private getSuccess(study: Study): void {
    this.study = study;
    this.isLoading = false;
  }

  onUpdate(study: Study): void {
    this.study = study;
  }

}
