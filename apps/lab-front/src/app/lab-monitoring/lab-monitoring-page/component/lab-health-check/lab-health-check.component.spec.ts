import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabHealthCheckComponent} from './lab-health-check.component';

describe('LabHealthCheckComponent', () => {
  let component: LabHealthCheckComponent;
  let fixture: ComponentFixture<LabHealthCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabHealthCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabHealthCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
