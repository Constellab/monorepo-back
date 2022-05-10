import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaGroupCardComponent} from './ca-group-card.component';

describe('CaGroupCardComponent', () => {
  let component: CaGroupCardComponent;
  let fixture: ComponentFixture<CaGroupCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaGroupCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaGroupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
