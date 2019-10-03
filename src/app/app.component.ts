import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { map, delay, switchMap, takeWhile, startWith, merge, retryWhen, tap } from 'rxjs/operators';
import { Observable, fromEvent, interval, combineLatest, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const githubUsers = `https://api.github.com/users?per_page=2`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  private isOnlineSubscr: Subscription;
  private isLoginSubscr: Subscription;
  private longPollSubscr: Subscription;
  isUserOnline: boolean;
  isUserLoggedIn: boolean;
  isUserOnline$: Observable<boolean>;
  isUserLoggedIn$: Observable<boolean>;
  @ViewChild('loginButton', { static: false }) button: ElementRef;

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.isUserOnline$ = this.getOnlineStatus();
    this.isOnlineSubscr = this.isUserOnline$.subscribe((isOnline: boolean) => {
      this.isUserOnline = isOnline;
      console.log({ isOnline });
      if (isOnline) {
        this.longPollingRequests();
      }
    });
  }

  ngAfterViewInit() {
    const isLoginEvents$ = fromEvent(this.button.nativeElement, 'click').pipe(
      map(() => this.isUserLoggedIn),
    );
    this.isLoginSubscr = isLoginEvents$.subscribe(res => {
      if (this.isUserOnline) {
        this.isUserLoggedIn = !res;
      }
    });

    this.isUserLoggedIn$ = combineLatest(
      isLoginEvents$,
      this.isUserOnline$,
    ).pipe(
      map((values: Array<boolean>) => values.every(i => i))
    );
  }

  private getOnlineStatus(): Observable<boolean> {
    const WINDOW = window;
    const onlineEvents$ = fromEvent(WINDOW, 'online').pipe(
      map(() => true)
    );
    const offlineEvents$ = fromEvent(WINDOW, 'offline').pipe(
      map(() => false)
    );
    const isUserOnline$ = onlineEvents$.pipe(
      merge(offlineEvents$),
      startWith(WINDOW.navigator.onLine)
    );
    return isUserOnline$;
  }

  private longPollingRequests() {
    this.longPollSubscr = interval(2000).pipe(
      switchMap(() => this.http.get(githubUsers)),
      takeWhile(() => this.isUserOnline),
      retryWhen(errors =>
        errors.pipe(
          tap(error => console.log('Error: ', error)),
          delay(3000)
        )
      )
    ).subscribe(data => { console.log('Data', data); });
  }

  ngOnDestroy() {
    this.isOnlineSubscr.unsubscribe();
    this.isLoginSubscr.unsubscribe();
    this.longPollSubscr.unsubscribe();
  }
}
