import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self
} from '@angular/core';
import {CaProject, CaProjectDatasource} from '../../../../model/entities/ca-project.class';
import {CaProjectService} from '../../../../service-api/ca-project.service';
import {Observable} from 'rxjs';
import {FlFormFieldDirective} from '@monorepo/front-core-lib';
import {NgControl} from '@angular/forms';


@Component({
  selector: 'ca-select-project',
  templateUrl: './ca-select-project.component.html',
  styleUrls: ['./ca-select-project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaSelectProjectComponent extends FlFormFieldDirective<CaProject>
  implements OnInit, OnDestroy {

  @Output() projectChange: EventEmitter<CaProject> = new EventEmitter();

  projectsDatasource: CaProjectDatasource;
  projects$: Observable<CaProject[]>;

  isLoading: boolean = false;

  constructor(@Optional() @Self() ngControl: NgControl,
              private projectService: CaProjectService) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.projectsDatasource = this.projectService.getMyProjectsDatasource();
    this.projects$ = this.projectsDatasource.connect();
  }

  callChangeEvent(value: CaProject): void {
    this.projectChange.emit(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: CaProject): void {
    this.value = obj;
  }

  isSelected(project: CaProject): boolean {
    return this.value && this.value.id === project.id;
  }

  selectCard(project: CaProject): void {
    if(this.disabled) return;
    this.setAndEmitValue(project);
  }

  ngOnDestroy(): void {
    this.projectsDatasource?.disconnect();
  }


}
