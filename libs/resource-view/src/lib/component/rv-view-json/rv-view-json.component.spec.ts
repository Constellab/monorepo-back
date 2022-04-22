import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvViewJsonComponent} from './rv-view-json.component';

describe('BioxResourceJsonComponent', () => {
  let component: RvViewJsonComponent;
  let fixture: ComponentFixture<RvViewJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvViewJsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvViewJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
