import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAddCardComponent} from './ca-add-card.component';

describe('CaAddCardComponent', () => {
  let component: CaAddCardComponent;
  let fixture: ComponentFixture<CaAddCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAddCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAddCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
