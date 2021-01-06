import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceTableComponent} from './lab-instance-table.component';

describe('LabInstanceTableComponent', () => {
  let component: LabInstanceTableComponent;
  let fixture: ComponentFixture<LabInstanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
