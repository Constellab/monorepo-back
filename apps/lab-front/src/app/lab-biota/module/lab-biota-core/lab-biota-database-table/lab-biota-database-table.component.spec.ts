import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDatabaseTableComponent} from './lab-biota-database-table.component';

describe('BiotaDatabaseTableComponent', () => {
  let component: LabBiotaDatabaseTableComponent;
  let fixture: ComponentFixture<LabBiotaDatabaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDatabaseTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDatabaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
