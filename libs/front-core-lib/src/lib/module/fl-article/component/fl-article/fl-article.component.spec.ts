import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlArticleComponent} from './fl-article.component';

describe('FlArticleComponent', () => {
  let component: FlArticleComponent;
  let fixture: ComponentFixture<FlArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlArticleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
