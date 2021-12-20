import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BiotaDatabaseTableComponent} from './biota-database-table.component';

describe('BiotaDatabaseTableComponent', () => {
  let component: BiotaDatabaseTableComponent;
  let fixture: ComponentFixture<BiotaDatabaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDatabaseTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDatabaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
