import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlContextMenuComponent} from './fl-context-menu.component';

describe('FlContextMenuComponent', () => {
  let component: FlContextMenuComponent;
  let fixture: ComponentFixture<FlContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlContextMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
