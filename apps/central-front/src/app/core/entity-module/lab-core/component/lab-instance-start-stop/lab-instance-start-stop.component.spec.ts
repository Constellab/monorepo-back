import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceStartStopComponent} from './lab-instance-start-stop.component';

describe('LabInstanceStartStopComponent', () => {
  let component: LabInstanceStartStopComponent;
  let fixture: ComponentFixture<LabInstanceStartStopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceStartStopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceStartStopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
