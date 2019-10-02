#1: Create a a long polling with Rxjs. Detect when online will start polling, when offline stop polling. (Subscribe change online/offline using rxjs. 
Write a function called getOnlineStatus(): Observable<boolean>)

#2: Detect when user is online and logged in using rxjs. Write a log "User is online and logged in" (online/offline status is used from above test. 
There is an observable called isUserLoggedIn$ will return value user is online true/false)