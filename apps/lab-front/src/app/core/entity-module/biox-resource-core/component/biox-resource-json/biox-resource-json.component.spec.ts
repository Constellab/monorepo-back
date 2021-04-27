import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceJsonComponent } from './biox-resource-json.component';

describe('BioxResourceJsonComponent', () => {
  let component: BioxResourceJsonComponent;
  let fixture: ComponentFixture<BioxResourceJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceJsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
