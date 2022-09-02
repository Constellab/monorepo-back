import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTaskViewerShowConfigComponent} from './lab-task-viewer-show-config.component';

describe('LabTaskViewerConfigurationComponent', () => {
  let component: LabTaskViewerShowConfigComponent;
  let fixture: ComponentFixture<LabTaskViewerShowConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTaskViewerShowConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabTaskViewerShowConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
