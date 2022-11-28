import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceUserTableComponent} from './ca-space-user-table.component';

describe('CaSpaceUserTableComponent', () => {
  let component: CaSpaceUserTableComponent;
  let fixture: ComponentFixture<CaSpaceUserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceUserTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
