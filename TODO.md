**TODO**

* REMOVE SHARED VARIABLES, THEY ARE CONFUSING & ERROR-PRONE
* Finish the WebSQL backend.
* merge helpers with front-end
* all files should be 
   + in separate module, but under wunderlist namespace object
   + OR each should be an AMD & loaded dynamically with require.js
   + pass jshint in es5 strict mode
* implement indexedDB & AJAX backend in database.js
* cache long object lookups like wunderlist.helpers.utils. in local variables like UTILS (to be done after all the refactoring)
* backend should be completely independent of DOM & modules should go in W.backend so that it can be pushed to a web-worker if needed
* CSS lint all stylesheet & convert them to LESS/Stylus eventually
* Write Unit Tests 
* Move to something like JavascriptMVC or Backbone or knockoutjs or angularjs
* Reduce memory leaks (crosses 150MB on chrome after a while).. Reuse DOM 
* Use documentFragments instead of directly attaching to DOM for better performance
* DOM based notifications for browsers other than Chrome & notification API on chrome
* write properties helper that works over Titanium & localStorage(for web)
* Most dialogs should go into there own modules, like notes dialogs should be in notes.js, making the code more independant. dialogs.js should be much smaller
* html.js, dialog.js & sortdrop.js are too vague & chaotic... tasks.js should manage its own drag-drop & so should lists.js .. both should manage there own markup generation as well as dialogs.... dialogs.js should only contain other dialogs like login, settings & stuff.

<br/>
***

**to clean up**:

 * helpers - html
 * frontend - tasks, menu, hotkeys
 * backend - sharing, database, account
 * libraries - shortcuts.js