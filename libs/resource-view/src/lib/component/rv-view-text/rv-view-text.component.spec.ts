import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvViewTextComponent} from './rv-view-text.component';

describe('BioxResourceTextComponent', () => {
  let component: RvViewTextComponent;
  let fixture: ComponentFixture<RvViewTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvViewTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvViewTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
