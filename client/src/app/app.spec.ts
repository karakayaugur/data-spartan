import { globalCacheBusterNotifier } from "ts-cacheable";
import { BreakpointObserver } from "@angular/cdk/layout";
import { BehaviorSubject } from "rxjs";
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { provideLucideIcons, LucideSun, LucideMoon, LucideCalendar, LucideX, LucideCircleAlert, LucideClock, LucideMenu, LucideTrash2 } from '@lucide/angular';
import { FILMS_STORAGE_KEY, FilmsService } from "@core/store";
import { routes } from './app.routes';

const films = [{ id: 1, title: 'A New Hope', episodeId: 4, releaseDate: '1977-05-25' }];
const film = { ...films[0], openingCrawl: 'It is a period of civil war.', director: 'George Lucas', cast: [{ id: 2, name: 'C-3PO' }] };

describe('Film browsing', () => {
  beforeEach(() => globalCacheBusterNotifier.next());
  beforeEach(() => { sessionStorage.removeItem(FILMS_STORAGE_KEY); sessionStorage.removeItem('data-spartan.viewing-log'); });
  afterEach(() => sessionStorage.removeItem(FILMS_STORAGE_KEY));
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideRouter(routes), provideHttpClient(), provideHttpClientTesting(),
      provideLucideIcons(LucideSun, LucideMoon, LucideCalendar, LucideX, LucideCircleAlert, LucideClock, LucideMenu, LucideTrash2),
    ] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows the selected film viewing count and reacts to additions, deletions and navigation', async () => {
    const store = TestBed.inject(FilmsService);
    const payload = { date: '2026-11-13', time: '19:30', description: '' };
    store.addViewing(1, payload);
    store.addViewing(2, payload);
    store.addViewing(2, payload);
    const harness = await RouterTestingHarness.create('/films/1');
    http.expectOne('/proxyUrl/films').flush(films);
    http.expectOne('/proxyUrl/films/1').flush(film);
    harness.detectChanges();
    const count = () => harness.routeNativeElement!.querySelector('.viewing-count')!.textContent;
    expect(count()).toContain('Watched 1 time');
    store.addViewing(1, payload);
    harness.detectChanges();
    expect(count()).toContain('Watched 2 times');
    for (const viewing of store.getViewings(1)) store.removeViewing(1, viewing.id);
    harness.detectChanges();
    expect(count()).toContain('Watched 0 times');
    await harness.navigateByUrl('/films/2');
    http.expectOne('/proxyUrl/films/2').flush({ ...film, id: 2 });
    harness.detectChanges();
    expect(count()).toContain('Watched 2 times');
  });

  it('keeps desktop film labels and viewing history available without a collapse toggle', async () => {
    const harness = await RouterTestingHarness.create('/films/1');
    http.expectOne('/proxyUrl/films').flush(films);
    http.expectOne('/proxyUrl/films/1').flush(film);
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    expect(root.querySelector('.collapse-toggle')).toBeNull();
    expect(root.querySelector('.film-title')?.textContent).toContain('A New Hope');
    expect(root.querySelector('.film-link')?.getAttribute('aria-current')).toBe('page');
    expect(root.querySelector('.sidebar-footer app-theme-toggle')).not.toBeNull();
    (root.querySelector('.viewing-button') as HTMLButtonElement).click();
    TestBed.tick();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('app-viewing-log')?.textContent).toContain('A New Hope');
    (overlay.querySelector('.close button') as HTMLButtonElement).click();
    TestBed.tick();
  });

  it('loads the sidebar on startup and shows a robot profile beside the film cast', async () => {
    const harness = await RouterTestingHarness.create('/films/1');
    http.expectOne('/proxyUrl/films').flush(films);
    http.expectOne('/proxyUrl/films/1').flush(film);
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('nav a')?.textContent).toContain('A New Hope');
    expect(harness.routeNativeElement?.querySelector('nav a')?.getAttribute('aria-current')).toBe('page');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('A New Hope');
    expect(harness.routeNativeElement?.querySelector('.crawl')?.textContent).toContain(film.openingCrawl);
    (harness.routeNativeElement?.querySelector('.character') as HTMLButtonElement).click();
    TestBed.tick();
    http.expectOne('/proxyUrl/characters/2').flush({ id: 2, name: 'C-3PO', kind: 'robot', height: '167', mass: '75', manufacturingYear: '112BBY' });
    TestBed.tick();
    const panel = harness.routeNativeElement!.querySelector('app-character-panel')!;
    expect(panel.textContent).toContain('Artificial being');
    expect(panel.textContent).toContain('112BBY');
    expect(panel.textContent).toContain('75 kg');
    expect(TestBed.inject(OverlayContainer).getContainerElement().querySelector('[role=dialog]')).toBeNull();
  });

  it('cancels an old film request when navigating and allows retry after an error', async () => {
    const harness = await RouterTestingHarness.create('/films/1');
    http.expectOne('/proxyUrl/films').flush(films);
    const oldRequest = http.expectOne('/proxyUrl/films/1');
    await harness.navigateByUrl('/films/2');
    expect(oldRequest.cancelled).toBeTrue();
    http.expectOne('/proxyUrl/films/2').flush({}, { status: 502, statusText: 'Bad Gateway' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Film unavailable');
    (harness.routeNativeElement?.querySelector('.content .retry') as HTMLButtonElement).click();
    http.expectOne('/proxyUrl/films/2').flush({ ...film, id: 2, title: 'The Empire Strikes Back' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('The Empire Strikes Back');
  });

  it('shows an organic profile and an honest unknown for missing species', async () => {
    const harness = await RouterTestingHarness.create('/films/1');
    http.expectOne('/proxyUrl/films').flush(films);
    http.expectOne('/proxyUrl/films/1').flush({ ...film, cast: [{ id: 1, name: 'Luke Skywalker' }] });
    harness.detectChanges();
    (harness.routeNativeElement?.querySelector('.character') as HTMLButtonElement).click();
    TestBed.tick();
    http.expectOne('/proxyUrl/characters/1').flush({ id: 1, name: 'Luke Skywalker', kind: 'organic', height: '172', birthYear: '19BBY', homeworld: 'Tatooine', species: [] });
    TestBed.tick();
    const panel = harness.routeNativeElement!.querySelector('app-character-panel')!;
    expect(panel.textContent).toContain('Tatooine');
    expect(panel.textContent).toContain('Unknown');
    expect(panel.textContent).toContain('19BBY');
    expect(panel.textContent).not.toContain('Manufacturing year');
  });
});

describe('Viewing log', () => {
  beforeEach(() => globalCacheBusterNotifier.next());
  beforeEach(() => sessionStorage.removeItem(FILMS_STORAGE_KEY));
  afterEach(() => sessionStorage.removeItem(FILMS_STORAGE_KEY));
  let http: HttpTestingController;
  let overlay: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideRouter(routes), provideHttpClient(), provideHttpClientTesting(),
      provideLucideIcons(LucideSun, LucideMoon, LucideCalendar, LucideX, LucideCircleAlert, LucideClock, LucideMenu, LucideTrash2),
    ] });
    http = TestBed.inject(HttpTestingController);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });
  afterEach(() => http.verify());

  function setValue(selector: string, value: string): void {
    if (selector === '#viewing-time') {
      (overlay.querySelector(selector) as HTMLButtonElement).click();
      TestBed.tick();
      const [hour, minute] = value.split(':');
      const groups = overlay.querySelectorAll('.time-options');
      [hour, minute].forEach((part, index) => {
        Array.from(groups[index].querySelectorAll<HTMLButtonElement>('button'))
          .find(button => button.textContent?.trim() === part)!.click();
      });
      (overlay.querySelector('#viewing-time') as HTMLButtonElement).click();
      TestBed.tick();
      return;
    }
    if (selector === '#viewing-date') {
      (overlay.querySelector(selector) as HTMLButtonElement).click();
      TestBed.tick();
      const [year, month, day] = value.split('-').map(Number);
      const select = (selector: string, value: number) => {
        const field = overlay.querySelector(selector) as HTMLSelectElement;
        field.value = String(value);
        field.dispatchEvent(new Event('change', { bubbles: true }));
        TestBed.tick();
      };
      select('.year-select', year);
      select('.month-select', month - 1);
      const button = Array.from(overlay.querySelectorAll<HTMLButtonElement>('.day:not(.day--muted)'))
        .find(button => button.textContent?.trim() === String(day))!;
      button.click();
      TestBed.tick();
      return;
    }
    const input = overlay.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    TestBed.tick();
  }
  function submit(): void {
    overlay.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    TestBed.tick();
  }
  function close(): void {
    (overlay.querySelector('.close button') as HTMLButtonElement).click();
    TestBed.tick();
  }

  it('validates required fields, keeps multiple entries on reopen, isolates films, and deletes entries', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    http.expectOne('/proxyUrl/films').flush([...films, { ...films[0], id: 2, title: 'The Empire Strikes Back' }]);
    harness.detectChanges();
    const buttons = harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.viewing-button');
    const open = (index: number) => { buttons[index].click(); TestBed.tick(); };
    open(0);
    const dateStyle = getComputedStyle(overlay.querySelector('#viewing-date')!);
    const timeStyle = getComputedStyle(overlay.querySelector('#viewing-time')!);
    for (const property of ['height', 'background-color', 'border-radius', 'border-top-color', 'font-size']) {
      expect(dateStyle.getPropertyValue(property)).withContext(property).toBe(timeStyle.getPropertyValue(property));
    }
    submit();
    expect(overlay.querySelectorAll('.feedback').length).toBe(2);
    expect(overlay.querySelectorAll('.viewing').length).toBe(0);
    setValue('#viewing-date', '2026-11-01');
    setValue('#viewing-time', '19:30');
    setValue('#viewing-description', 'Watched with friends');
    submit();
    setValue('#viewing-date', '2026-11-02');
    setValue('#viewing-time', '20:15');
    submit();
    expect(overlay.querySelectorAll('.viewing').length).toBe(2);
    expect(overlay.textContent).toContain('Watched with friends');
    close();
    open(0);
    expect(overlay.querySelectorAll('.viewing').length).toBe(2);
    close();
    open(1);
    expect(overlay.querySelectorAll('.viewing').length).toBe(0);
    close();
    open(0);
    (overlay.querySelector('.delete button') as HTMLButtonElement).click();
    TestBed.tick();
    expect(overlay.querySelectorAll('.viewing').length).toBe(1);
    expect(overlay.textContent).not.toContain('Watched with friends');
    close();
    open(0);
    expect(overlay.querySelectorAll('.viewing').length).toBe(1);
  });
});

describe('Mobile sidebar', () => {
  beforeEach(() => globalCacheBusterNotifier.next());
  let http: HttpTestingController;
  const breakpoint = new BehaviorSubject({ matches: true, breakpoints: { '(max-width: 640px)': true } });

  beforeEach(() => {
    sessionStorage.removeItem(FILMS_STORAGE_KEY);
    sessionStorage.removeItem('data-spartan.viewing-log');
    breakpoint.next({ matches: true, breakpoints: { '(max-width: 640px)': true } });
    TestBed.configureTestingModule({ providers: [
      provideRouter(routes), provideHttpClient(), provideHttpClientTesting(),
      provideLucideIcons(LucideSun, LucideMoon, LucideCalendar, LucideX, LucideCircleAlert, LucideClock, LucideMenu, LucideTrash2),
      { provide: BreakpointObserver, useValue: { observe: () => breakpoint.asObservable(), isMatched: () => breakpoint.value.matches } },
    ] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); sessionStorage.removeItem(FILMS_STORAGE_KEY); });

  it('opens a modal drawer and closes on Escape, backdrop, selection and desktop resize', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    http.expectOne('/proxyUrl/films').flush(films);
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    const open = () => { (root.querySelector('.menu-toggle') as HTMLButtonElement).click(); harness.detectChanges(); };
    expect(root.querySelector('aside')).toBeNull();
    open();
    expect(root.querySelector('aside')?.getAttribute('aria-modal')).toBe('true');
    expect(root.querySelector('main')?.inert).toBeTrue();
    root.querySelector('aside')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    harness.detectChanges();
    expect(root.querySelector('aside')).toBeNull();
    expect(root.querySelector('main')?.inert).toBeFalse();
    open();
    (root.querySelector('.sidebar-backdrop') as HTMLElement).click();
    harness.detectChanges();
    expect(root.querySelector('aside')).toBeNull();
    open();
    (root.querySelector('.film-link') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    http.expectOne('/proxyUrl/films/1').flush(film);
    harness.detectChanges();
    expect(root.querySelector('aside')).toBeNull();
    expect(root.querySelector('h1')?.textContent).toContain('A New Hope');
    open();
    breakpoint.next({ matches: false, breakpoints: { '(max-width: 640px)': false } });
    harness.detectChanges();
    expect(root.querySelector('.sidebar-backdrop')).toBeNull();
    expect(root.querySelector('aside')).not.toBeNull();
    expect(root.querySelector('aside')?.getAttribute('aria-modal')).toBeNull();
  });

  it('opens viewing history from the drawer and closes the drawer', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    http.expectOne('/proxyUrl/films').flush(films);
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    (root.querySelector('.menu-toggle') as HTMLButtonElement).click();
    harness.detectChanges();
    (root.querySelector('.viewing-button') as HTMLButtonElement).click();
    harness.detectChanges();
    TestBed.tick();
    expect(root.querySelector('aside')).toBeNull();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('app-viewing-log')?.textContent).toContain('A New Hope');
    (overlay.querySelector('.close button') as HTMLButtonElement).click();
    TestBed.tick();
    expect(root.querySelector('.menu-toggle')?.getAttribute('aria-expanded')).toBe('false');
  });
});
