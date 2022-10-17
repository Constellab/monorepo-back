import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectExperimentPreviewComponent} from './ca-project-experiment-preview.component';

describe('CaProjectExperimentPreviewComponent', () => {
  let component: CaProjectExperimentPreviewComponent;
  let fixture: ComponentFixture<CaProjectExperimentPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectExperimentPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectExperimentPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
