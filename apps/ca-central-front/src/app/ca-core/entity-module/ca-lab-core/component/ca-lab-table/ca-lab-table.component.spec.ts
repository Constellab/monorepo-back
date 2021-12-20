import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabTableComponent} from './ca-lab-table.component';

describe('LabTableComponent', () => {
  let component: CaLabTableComponent;
  let fixture: ComponentFixture<CaLabTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
