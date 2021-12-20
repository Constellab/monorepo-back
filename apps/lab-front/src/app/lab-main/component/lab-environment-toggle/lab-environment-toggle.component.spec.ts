import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabEnvironmentToggleComponent} from './lab-environment-toggle.component';

describe('LabEnvironmentToogleComponent', () => {
  let component: LabEnvironmentToggleComponent;
  let fixture: ComponentFixture<LabEnvironmentToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabEnvironmentToggleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabEnvironmentToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
