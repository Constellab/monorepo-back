import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlFromNowComponent } from './fl-from-now.component';

describe('FlFromNowComponent', () => {
  let component: FlFromNowComponent;
  let fixture: ComponentFixture<FlFromNowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlFromNowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlFromNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
