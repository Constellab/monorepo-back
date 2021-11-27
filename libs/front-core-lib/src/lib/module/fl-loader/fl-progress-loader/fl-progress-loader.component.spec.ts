import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlProgressLoaderComponent } from './fl-progress-loader.component';

describe('FlProgressLoaderComponent', () => {
  let component: FlProgressLoaderComponent;
  let fixture: ComponentFixture<FlProgressLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlProgressLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlProgressLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
