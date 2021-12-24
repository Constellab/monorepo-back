import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlCreationInfoComponent} from './fl-creation-info.component';

describe('FlCreationInfoComponent', () => {
  let component: FlCreationInfoComponent;
  let fixture: ComponentFixture<FlCreationInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlCreationInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlCreationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
