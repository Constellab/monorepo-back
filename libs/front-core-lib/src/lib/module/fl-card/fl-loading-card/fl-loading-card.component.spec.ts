import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlLoadingCardComponent } from './fl-loading-card.component';

describe('FlLoadingCardComponent', () => {
  let component: FlLoadingCardComponent;
  let fixture: ComponentFixture<FlLoadingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlLoadingCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlLoadingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
