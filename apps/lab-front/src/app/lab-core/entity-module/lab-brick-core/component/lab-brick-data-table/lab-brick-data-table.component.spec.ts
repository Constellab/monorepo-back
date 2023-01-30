import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBrickDataTableComponent} from './lab-brick-data-table.component';

describe('LabBrickDataTableComponent', () => {
  let component: LabBrickDataTableComponent;
  let fixture: ComponentFixture<LabBrickDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBrickDataTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabBrickDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
