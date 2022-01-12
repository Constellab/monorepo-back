import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessTypeTableComponent} from './lab-process-type-table.component';

describe('LabProcessTypeTableComponent', () => {
  let component: LabProcessTypeTableComponent;
  let fixture: ComponentFixture<LabProcessTypeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessTypeTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
