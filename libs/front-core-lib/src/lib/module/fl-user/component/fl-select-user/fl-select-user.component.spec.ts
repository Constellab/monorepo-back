import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSelectUserComponent} from './fl-select-user.component';

describe('FlSelectUserComponent', () => {
  let component: FlSelectUserComponent;
  let fixture: ComponentFixture<FlSelectUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSelectUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlSelectUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
