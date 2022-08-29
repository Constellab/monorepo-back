import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceInfoComponent} from './lab-resource-info.component';

describe('LabResourceInfoComponent', () => {
  let component: LabResourceInfoComponent;
  let fixture: ComponentFixture<LabResourceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
