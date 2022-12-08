import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabLogTableComponent} from './lab-log-table.component';

describe('LabLogTableComponent', () => {
  let component: LabLogTableComponent;
  let fixture: ComponentFixture<LabLogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLogTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabLogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
