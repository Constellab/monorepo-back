import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlExpansionMenuComponent} from './fl-expansion-menu.component';

describe('FlExpansionMenuComponent', () => {
  let component: FlExpansionMenuComponent;
  let fixture: ComponentFixture<FlExpansionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlExpansionMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlExpansionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
