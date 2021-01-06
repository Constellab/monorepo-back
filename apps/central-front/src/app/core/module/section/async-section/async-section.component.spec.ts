import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AsyncSectionComponent} from './async-section.component';

describe('AsyncSectionComponent', () => {
  let component: AsyncSectionComponent;
  let fixture: ComponentFixture<AsyncSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsyncSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsyncSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
