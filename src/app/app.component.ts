import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, fromEvent, from, interval, of } from 'rxjs';
import { map, switchMap, mergeMap, takeWhile } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  private apiEndpoint = 'http://localhost:4200';
  private networkStatus: string;

  constructor(
    private http: HttpClient,
  ) {
    this.networkStatus = window.navigator.onLine ? 'online' : 'offline';
    console.log('networkStatus', this.networkStatus);
  }

  ngOnInit() {
    this.getOnlineStatus()
      .subscribe((status: string) => {
        this.networkStatus = status;
        console.log('networkStatus', this.networkStatus);
        if (status === 'online') {
          this.longPollingRequests();
        }
      })
    this.longPollingRequests();
  }

  getOnlineStatus(): Observable<string> {
    const events = ['online', 'offline']
    return from(events)
      .pipe(
        mergeMap(event => fromEvent(window, event)),
        map((event: Event) => event.type)
      )
  }

  longPollingRequests() {
    interval(1500).pipe(
      switchMap(() => of(1)),
      // switchMap(() => this.http.get(this.apiEndpoint)),
      takeWhile(() => this.networkStatus === 'online')
    ).subscribe(
      data => { console.log('Data', data) },
      error => { console.log('Error: ', error) }
    )
  }
}
