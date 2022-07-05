import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdDocIoComponent} from './td-doc-io.component';

describe('TdDocIoComponent', () => {
  let component: TdDocIoComponent;
  let fixture: ComponentFixture<TdDocIoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdDocIoComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdDocIoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
