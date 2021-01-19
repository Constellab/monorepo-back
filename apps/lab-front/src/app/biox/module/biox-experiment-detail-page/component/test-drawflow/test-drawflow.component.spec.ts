import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDrawflowComponent } from './test-drawflow.component';

describe('TestDrawflowComponent', () => {
  let component: TestDrawflowComponent;
  let fixture: ComponentFixture<TestDrawflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestDrawflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDrawflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
