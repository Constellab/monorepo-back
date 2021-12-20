import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabErrorDetailComponent} from './lab-error-detail.component';

describe('ErrorDetailComponent', () => {
  let component: LabErrorDetailComponent;
  let fixture: ComponentFixture<LabErrorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabErrorDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabErrorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
