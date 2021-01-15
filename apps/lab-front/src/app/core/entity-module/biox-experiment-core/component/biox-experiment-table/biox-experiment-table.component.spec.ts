import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxExperimentTableComponent } from './biox-experiment-table.component';

describe('LabExperimentTableComponent', () => {
  let component: BioxExperimentTableComponent;
  let fixture: ComponentFixture<BioxExperimentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
