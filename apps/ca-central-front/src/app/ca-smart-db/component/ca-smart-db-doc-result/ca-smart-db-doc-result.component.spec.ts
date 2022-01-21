import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbDocResultComponent} from './ca-smart-db-doc-result.component';

describe('CaSmartDbDocResultComponent', () => {
  let component: CaSmartDbDocResultComponent;
  let fixture: ComponentFixture<CaSmartDbDocResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbDocResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbDocResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
