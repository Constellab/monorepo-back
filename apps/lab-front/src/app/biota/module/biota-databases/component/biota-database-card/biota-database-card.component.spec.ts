import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiotaDatabaseCardComponent } from './biota-database-card.component';

describe('BiotaDatabaseCardComponent', () => {
  let component: BiotaDatabaseCardComponent;
  let fixture: ComponentFixture<BiotaDatabaseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDatabaseCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDatabaseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
