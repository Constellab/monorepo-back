import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceTableComponent} from './ca-space-table.component';

describe('CaSpaceTableComponent', () => {
  let component: CaSpaceTableComponent;
  let fixture: ComponentFixture<CaSpaceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSpaceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
