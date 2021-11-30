import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceCardComponent } from './biox-resource-card.component';

describe('BioxResourceCardComponent', () => {
  let component: BioxResourceCardComponent;
  let fixture: ComponentFixture<BioxResourceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
