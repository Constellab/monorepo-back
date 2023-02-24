import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProgressBarInfoComponent} from './lab-progress-bar-info.component';

describe('BioxWorkflowNodeProgressComponent', () => {
  let component: LabProgressBarInfoComponent;
  let fixture: ComponentFixture<LabProgressBarInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProgressBarInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProgressBarInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
