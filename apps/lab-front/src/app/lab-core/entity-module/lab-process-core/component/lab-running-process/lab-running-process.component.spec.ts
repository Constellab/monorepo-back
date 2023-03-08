import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabRunningProcessComponent } from './lab-running-process.component';

describe('LabRunningProcessComponent', () => {
  let component: LabRunningProcessComponent;
  let fixture: ComponentFixture<LabRunningProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabRunningProcessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabRunningProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
