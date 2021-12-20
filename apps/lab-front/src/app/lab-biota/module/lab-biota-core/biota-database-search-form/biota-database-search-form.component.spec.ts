import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BiotaDatabaseSearchFormComponent} from './biota-database-search-form.component';

describe('BiotaDatabaseSearchFormComponent', () => {
  let component: BiotaDatabaseSearchFormComponent;
  let fixture: ComponentFixture<BiotaDatabaseSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDatabaseSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDatabaseSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
