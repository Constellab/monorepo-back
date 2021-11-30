import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlInputFileIconContainerComponent } from './fl-input-file-icon-container.component';

describe('FlInputFileIconContainerComponent', () => {
  let component: FlInputFileIconContainerComponent;
  let fixture: ComponentFixture<FlInputFileIconContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlInputFileIconContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlInputFileIconContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
