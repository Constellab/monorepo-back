import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceDetailComponent} from './lab-instance-detail.component';

describe('LabInstanceDetailCardComponent', () => {
  let component: LabInstanceDetailComponent;
  let fixture: ComponentFixture<LabInstanceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
