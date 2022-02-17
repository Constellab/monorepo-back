import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabConfigTableComponent} from './ca-lab-config-table.component';

describe('LabTableComponent', () => {
  let component: CaLabConfigTableComponent;
  let fixture: ComponentFixture<CaLabConfigTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabConfigTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
