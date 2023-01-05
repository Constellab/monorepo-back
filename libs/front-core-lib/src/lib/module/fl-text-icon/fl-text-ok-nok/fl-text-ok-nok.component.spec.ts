import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextOkNokComponent} from './fl-text-ok-nok.component';

describe('FlTextOkNokComponent', () => {
  let component: FlTextOkNokComponent;
  let fixture: ComponentFixture<FlTextOkNokComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextOkNokComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlTextOkNokComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
