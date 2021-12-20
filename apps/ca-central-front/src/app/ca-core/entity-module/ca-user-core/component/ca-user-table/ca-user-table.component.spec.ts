import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserTableComponent} from './ca-user-table.component';

describe('UserTableComponent', () => {
  let component: CaUserTableComponent;
  let fixture: ComponentFixture<CaUserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
