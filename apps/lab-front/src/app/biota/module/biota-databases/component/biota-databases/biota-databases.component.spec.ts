import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiotaDatabasesComponent } from './biota-databases.component';

describe('BiotaDatabasesComponent', () => {
  let component: BiotaDatabasesComponent;
  let fixture: ComponentFixture<BiotaDatabasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDatabasesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDatabasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
