import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiotaDatabaseDetailPageComponent } from './biota-database-detail-page.component';

describe('BiotaDatabaseDetailPageComponent', () => {
  let component: BiotaDatabaseDetailPageComponent;
  let fixture: ComponentFixture<BiotaDatabaseDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDatabaseDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDatabaseDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
