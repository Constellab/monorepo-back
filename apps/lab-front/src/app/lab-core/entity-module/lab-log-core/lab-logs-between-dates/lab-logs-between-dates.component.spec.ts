import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabLogsBetweenDatesComponent} from './lab-logs-between-dates.component';

describe('LabLogsBetweenDatesComponent', () => {
  let component: LabLogsBetweenDatesComponent;
  let fixture: ComponentFixture<LabLogsBetweenDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLogsBetweenDatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabLogsBetweenDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
