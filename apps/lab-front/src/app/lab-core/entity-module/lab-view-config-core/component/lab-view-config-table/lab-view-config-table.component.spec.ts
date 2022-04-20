import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigTableComponent} from './lab-view-config-table.component';

describe('LabViewConfigTableComponent', () => {
  let component: LabViewConfigTableComponent;
  let fixture: ComponentFixture<LabViewConfigTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabViewConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
