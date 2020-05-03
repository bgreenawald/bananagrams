import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuGameplayComponent } from './menu-gameplay.component';

describe('MenuGameplayComponent', () => {
  let component: MenuGameplayComponent;
  let fixture: ComponentFixture<MenuGameplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuGameplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuGameplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
