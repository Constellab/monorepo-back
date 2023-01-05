import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceStartStopComponent} from './ca-lab-instance-start-stop.component';

describe('LabInstanceStartStopComponent', () => {
  let component: CaLabInstanceStartStopComponent;
  let fixture: ComponentFixture<CaLabInstanceStartStopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceStartStopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceStartStopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
