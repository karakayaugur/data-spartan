import { TestBed } from '@angular/core/testing';
import { provideLucideIcons, LucideClock, LucideX } from '@lucide/angular';
import { InputDateComponent } from './input-date.component';

describe('InputDateComponent time mode', () => {
  it('selects time in a themed popup and validates HH:mm', () => {
    TestBed.configureTestingModule({ providers: [provideLucideIcons(LucideX, LucideClock)] });
    const fixture = TestBed.createComponent(InputDateComponent);
    fixture.componentRef.setInput('inputId', 'test-time');
    fixture.componentRef.setInput('type', 'time');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('input[type=time]')).toBeNull();
    expect(fixture.componentInstance.validate()).toBeFalse();
    (root.querySelector('.date-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('00:00');
    expect(root.querySelector('.time-confirm')).toBeNull();
    const groups = root.querySelectorAll('.time-options');
    expect(groups[1].querySelectorAll('button').length).toBe(12);
    ['23', '55'].forEach((value, index) => {
      Array.from(groups[index].querySelectorAll<HTMLButtonElement>('button'))
        .find(button => button.textContent?.trim() === value)!.click();
    });
    fixture.detectChanges();
    expect(root.querySelectorAll('.time-option.selected').length).toBe(2);
    expect(fixture.componentInstance.value()).toBe('23:55');
    (root.querySelector('.date-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('23:55');
    expect(root.querySelector('.date-dropdown')).toBeNull();
    expect(fixture.componentInstance.validate()).toBeTrue();
    for (const value of ['24:00', '12:60', '2026-11-13']) {
      fixture.componentInstance.value.set(value);
      expect(fixture.componentInstance.validate()).toBeFalse();
    }
  });
});
