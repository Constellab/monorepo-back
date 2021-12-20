import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaReportsListComponent} from './ca-reports-list.component';

describe('ReportsListComponent', () => {
  let component: CaReportsListComponent;
  let fixture: ComponentFixture<CaReportsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaReportsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaReportsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
