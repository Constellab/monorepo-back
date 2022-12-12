import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlUserInlineComponent} from './fl-user-inline.component';

describe('FlUserInlineComponent', () => {
  let component: FlUserInlineComponent;
  let fixture: ComponentFixture<FlUserInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlUserInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlUserInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
