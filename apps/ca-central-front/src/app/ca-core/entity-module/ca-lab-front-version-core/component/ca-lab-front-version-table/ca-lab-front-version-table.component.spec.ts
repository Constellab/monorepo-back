import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabFrontVersionTableComponent} from './ca-lab-front-version-table.component';

describe('CaAdminLabFrontVersionTableComponent', () => {
  let component: CaLabFrontVersionTableComponent;
  let fixture: ComponentFixture<CaLabFrontVersionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabFrontVersionTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabFrontVersionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
