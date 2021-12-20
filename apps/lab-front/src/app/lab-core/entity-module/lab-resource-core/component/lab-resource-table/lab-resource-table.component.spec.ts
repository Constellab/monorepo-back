import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceTableComponent} from './lab-resource-table.component';

describe('FileResourceTableComponent', () => {
  let component: LabResourceTableComponent;
  let fixture: ComponentFixture<LabResourceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
