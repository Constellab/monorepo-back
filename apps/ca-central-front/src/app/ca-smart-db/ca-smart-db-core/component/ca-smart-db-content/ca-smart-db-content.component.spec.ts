import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbContentComponent} from './ca-smart-db-content.component';

describe('CaSmartDbResultContentComponent', () => {
  let component: CaSmartDbContentComponent;
  let fixture: ComponentFixture<CaSmartDbContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
