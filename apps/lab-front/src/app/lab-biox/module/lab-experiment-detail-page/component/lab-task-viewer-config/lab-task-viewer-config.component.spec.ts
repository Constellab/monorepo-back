import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTaskViewerConfigComponent} from './lab-task-viewer-config.component';

describe('LabViewTaskConfigComponent', () => {
  let component: LabTaskViewerConfigComponent;
  let fixture: ComponentFixture<LabTaskViewerConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTaskViewerConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabTaskViewerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
