import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceCardComponent} from './ca-lab-instance-card.component';

describe('LabInstanceCardComponent', () => {
  let component: CaLabInstanceCardComponent;
  let fixture: ComponentFixture<CaLabInstanceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
