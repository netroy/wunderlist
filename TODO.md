**TODO**

1. merge helpers with frontend
2. all files should be 
   + in separate module, but under wunderlist namespace object
   + pass jshint in es5 strict mode
3. implement indexedDB backend in database.js
4. cache long object lookups like wunderlist.helpers.utils. in local variables like UTILS (at the end)
5. backend should be completely independent of DOM & modules should go in W.backend
6. CSS lint all stylesheet & convert them to LESS/Stylus eventually
7. write unit tests 

<br/>
***

<br/>
**to clean up**:

 * helpers - html
 * frontend - tasks, sortdrop, share, menu, hotkeys
 * backend - updater, timer, sync, sharing, setting, notifications, language, database, account
 * libraries - shortcuts.js