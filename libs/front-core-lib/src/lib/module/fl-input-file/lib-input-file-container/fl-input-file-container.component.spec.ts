import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlInputFileContainerComponent} from './fl-input-file-container.component';

describe('LibInputFileContainerComponent', () => {
  let component: FlInputFileContainerComponent;
  let fixture: ComponentFixture<FlInputFileContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlInputFileContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlInputFileContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
