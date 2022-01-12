import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessTypeShowDetailButtonComponent} from './lab-process-type-show-detail-button.component';

describe('LabProcessTypeShowDetailButtonComponent', () => {
  let component: LabProcessTypeShowDetailButtonComponent;
  let fixture: ComponentFixture<LabProcessTypeShowDetailButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessTypeShowDetailButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessTypeShowDetailButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
