import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlButtonLoaderComponent} from './fl-button-loader.component';

describe('LibButtonLoaderComponent', () => {
  let component: FlButtonLoaderComponent;
  let fixture: ComponentFixture<FlButtonLoaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlButtonLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlButtonLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
