import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxExperimentDetailPageComponent } from './biox-experiment-detail-page.component';

describe('BioxExperimentDetailPageComponent', () => {
  let component: BioxExperimentDetailPageComponent;
  let fixture: ComponentFixture<BioxExperimentDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
