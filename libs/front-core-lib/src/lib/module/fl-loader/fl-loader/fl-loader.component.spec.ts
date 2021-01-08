import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlLoaderComponent} from './fl-loader.component';

describe('LibLoaderComponent', () => {
  let component: FlLoaderComponent;
  let fixture: ComponentFixture<FlLoaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
