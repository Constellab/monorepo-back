import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabCardComponent} from './ca-lab-card.component';

describe('LabCardComponent', () => {
  let component: CaLabCardComponent;
  let fixture: ComponentFixture<CaLabCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
