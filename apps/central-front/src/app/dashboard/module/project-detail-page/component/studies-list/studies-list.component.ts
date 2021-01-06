import {Component, Input, OnInit} from '@angular/core';
import {DialogService} from '../../../../../core/service/dialog.service';
import {Study} from '../../../../../core/model/entities/study.class';
import {StudyService} from '../../../../service/study.service';
import {StudyFormDialogComponent, StudyFormDialogInput} from '../../../study-core/component/study-form-dialog/study-form-dialog.component';
import {ArrayObs} from '../../../../../core/model/datasource/array-obs.class';

/**
 * In the project detail page, show the list of studies
 */
@Component({
  selector: 'gen-studies-list',
  templateUrl: './studies-list.component.html',
  styleUrls: ['./studies-list.component.scss']
})
export class StudiesListComponent implements OnInit {

  @Input() projectId: string;

  studiesArray: ArrayObs<Study>;


  constructor(private studyService: StudyService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.studiesArray = this.studyService.getStudiesOfProject(this.projectId);
  }


  openCreateStudyDialog(): void {
    const dialogInput: StudyFormDialogInput = {
      mode: 'create',
      projectId: this.projectId
    };
    this.dialogService.openSmallDialog(StudyFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      study => this.onCreateStudyClosed(study)
    );
  }

  private onCreateStudyClosed(study?: Study): void {
    if (study) {
      this.studiesArray.unshiftItem(study);
    }
  }
}
