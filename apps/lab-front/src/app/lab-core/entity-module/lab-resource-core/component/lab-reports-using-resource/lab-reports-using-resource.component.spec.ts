import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportsUsingResourceComponent} from './lab-reports-using-resource.component';

describe('LabReportsUsingResourceComponent', () => {
  let component: LabReportsUsingResourceComponent;
  let fixture: ComponentFixture<LabReportsUsingResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportsUsingResourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabReportsUsingResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
