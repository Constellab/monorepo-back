import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbDocCardComponent} from './ca-smart-db-doc-card.component';

describe('CaSmartDbDocCardComponent', () => {
  let component: CaSmartDbDocCardComponent;
  let fixture: ComponentFixture<CaSmartDbDocCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbDocCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbDocCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
