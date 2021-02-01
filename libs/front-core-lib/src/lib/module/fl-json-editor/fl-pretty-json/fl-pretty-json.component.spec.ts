import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlPrettyJsonComponent } from './fl-pretty-json.component';

describe('FlPrettyJsonComponent', () => {
  let component: FlPrettyJsonComponent;
  let fixture: ComponentFixture<FlPrettyJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPrettyJsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPrettyJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
