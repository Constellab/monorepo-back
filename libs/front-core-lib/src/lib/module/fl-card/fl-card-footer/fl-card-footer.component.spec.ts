import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlCardFooterComponent} from './fl-card-footer.component';

describe('CardFooterComponent', () => {
  let component: FlCardFooterComponent;
  let fixture: ComponentFixture<FlCardFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlCardFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlCardFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
