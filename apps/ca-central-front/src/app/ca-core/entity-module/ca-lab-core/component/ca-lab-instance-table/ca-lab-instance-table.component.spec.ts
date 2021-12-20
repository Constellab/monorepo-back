import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceTableComponent} from './ca-lab-instance-table.component';

describe('LabInstanceTableComponent', () => {
  let component: CaLabInstanceTableComponent;
  let fixture: ComponentFixture<CaLabInstanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
