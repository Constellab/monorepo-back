import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxTaskSourceConfigComponent} from './biox-task-source-config.component';

describe('BioxProcessSourceConfigComponent', () => {
  let component: BioxTaskSourceConfigComponent;
  let fixture: ComponentFixture<BioxTaskSourceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxTaskSourceConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxTaskSourceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
