import {Component, EventEmitter, OnInit, Optional, Output, Self} from '@angular/core';
import {FlFormFieldDirective, FlMenuDynamic, FlTranslateService} from '@monorepo/front-core-lib';
import {LabProject, LabProjectWithChildren} from '../../../../model/entities/lab-project.class';
import {NgControl} from '@angular/forms';
import {LabProjectService} from '../../../../entity-service/lab-project.service';

@Component({
  selector: 'lab-project-select-button',
  templateUrl: './lab-project-select-button.component.html',
  styleUrls: ['./lab-project-select-button.component.scss'],
  providers: [{provide: FlFormFieldDirective, useExisting: LabProjectSelectButtonComponent}]

})
export class LabProjectSelectButtonComponent extends FlFormFieldDirective<LabProject> implements OnInit {

  @Output() selectionChange: EventEmitter<LabProject> = new EventEmitter();

  menuDynamics: FlMenuDynamic[];

  constructor(@Optional() @Self() ngControl: NgControl,
              private translateService: FlTranslateService,
              private projectService: LabProjectService) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.projectService.getProjectTrees().subscribe(
      projects => this.onProjectTreeSuccess(projects)
    );
  }

  private onProjectTreeSuccess(projects: LabProjectWithChildren[]): void {
    this.menuDynamics = projects.map(project => this.projectTreeToFlMenuDynamic(project));
  }

  private projectTreeToFlMenuDynamic(project: LabProjectWithChildren): FlMenuDynamic {
    let onClick: () => void;
    if (project?.children.length > 0) {
      //ignore click on parent project
      onClick = () => {
      };
    } else {
      onClick = () => this.setAndEmitValue(project);
    }
    return {
      type: 'button',
      text: project.title,
      children: project.children.map(child => this.projectTreeToFlMenuDynamic(child)),
      onClick: onClick
    };
  }

  callChangeEvent(value: LabProject): void {
    this.selectionChange.emit(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: LabProject): void {
    this.value = obj;
  }

  get buttonText(): string {
    return this.value ? this.value.title : this.translateService.translate('biox.select_project');
  }

}
