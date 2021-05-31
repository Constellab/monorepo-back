import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlCardBodyComponent} from './fl-card-body.component';

describe('FlCardBodyComponent', () => {
  let component: FlCardBodyComponent;
  let fixture: ComponentFixture<FlCardBodyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlCardBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlCardBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
