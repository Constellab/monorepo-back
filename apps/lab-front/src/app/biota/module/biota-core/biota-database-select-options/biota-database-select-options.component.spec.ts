import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BiotaDatabaseSelectOptionsComponent} from './biota-database-select-options.component';

describe('BiotaDatabaseSelectOptionsComponent', () => {
  let component: BiotaDatabaseSelectOptionsComponent;
  let fixture: ComponentFixture<BiotaDatabaseSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDatabaseSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDatabaseSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
