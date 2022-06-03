import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailTabHeaderComponent} from './lab-resource-detail-tab-header.component';

describe('LabResourceDetailTabHeaderComponent', () => {
  let component: LabResourceDetailTabHeaderComponent;
  let fixture: ComponentFixture<LabResourceDetailTabHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailTabHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceDetailTabHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
