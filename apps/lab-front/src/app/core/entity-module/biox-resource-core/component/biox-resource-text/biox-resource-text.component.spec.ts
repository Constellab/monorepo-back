import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceTextComponent } from './biox-resource-text.component';

describe('BioxResourceTextComponent', () => {
  let component: BioxResourceTextComponent;
  let fixture: ComponentFixture<BioxResourceTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
