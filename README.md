# jquery-idleTimeout

Configurable idle (no activity) timer and logout redirect for jQuery.

<strong>Works cross-browser with multiple windows and tabs within the same domain.</strong>

After the 'idleTimeLimit' amount of time of user inactivity, a warning dialog box with 2 buttons, 'Stay Logged In' & 'Log Out Now', appears. 'Stay Logged In' button may be activated with mouse click or press of Enter key.

Warning dialog will display for the 'dialogDisplayLimit' amount of time. If no user activity, idleTimer will redirect user to 'redirectUrl'.

![Warning Dialog](https://raw.github.com/JillElaine/jquery-idleTimeout/master/warning_dialog.png)

Any needed logout (session close) functions may be added to your 'redirectUrl' page or to the optional 'customCallback'.

### Cross browser communication within the same domain

* Functions across multiple instances of a browser and across multiple tabs in the same browser window within the same domain
* If a window or tab is logged out, all other windows and tabs will log out too.
* If warning dialog pops up on a window or tab, warning dialog appears on all other windows and tabs too.
* If 'Stay Logged In' button on warning dialog is clicked, warning dialogs on all other windows and tabs will disappear too.
* If 'Log Out Now' button on warning dialog is clicked, all other windows and tabs will log out too.

### System requirements

The following dependency is required: https://github.com/marcuswestin/store.js - version 1.3.4+

Additionally, JQuery version 1.7+ and JQuery UI are required.

### Tested in These Browsers

* Mozilla Firefox v22.0
* Internet Explorer v8

Use jquery-idleTimeout-for-testing.js with Firefox with Firebug add-on or similar for debugging.

## How to use

You must configure the 'redirectUrl' to redirect to a page within your website.

Use the script with the other defaults or edit the other configuration options at top of jquery-idleTimeout.js script. Or configure the options when you call the idleTimeout function at run-time.

### Run with defaults

```Javascript
<script type="text/javascript">
  $(document).ready(function(){
    $(document).idleTimeout();
  });
</script>
```

### Configuration may be overridden at run-time

```Javascript
<script type="text/javascript">
  $(document).ready(function(){
    $(document).idleTimeout({
      idleTimeLimit: 1200000,       // 'No activity' time limit in milliseconds. 1200000 = 20 Minutes
      dialogDisplayLimit: 180000,   // Time to display the warning dialog before redirect (and optional callback) in milliseconds. 180000 = 3 Minutes
      redirectUrl: '/logout',       // redirect to this url

      // optional custom callback to perform before redirect
      customCallback: false,       // set to false for no customCallback
      // customCallback:    function() {    // define optional custom js function
          // perform custom action before logout
      // },

      // configure which activity events to detect
      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      activityEvents: 'click keypress scroll wheel mousewheel mousemove', // separate each event with a space

      //dialog box configuration
      dialogTitle: 'Session Expiration Warning',
      dialogText: 'Because you have been inactive, your session is about to expire.',

      // server-side session keep-alive timer & url
      sessionKeepAliveTimer: 60000, // Ping the server at this interval in milliseconds. 60000 = 1 Minute
      // sessionKeepAliveTimer: false, // Set to false to disable pings.
      sessionKeepAliveUrl: '/',  // url to ping
    });
  });
</script>
```

## Optional functionality
If user manually logs out (without use of idleTimer), you can force all other windows & tabs within the same domain to redirect to the 'redirectUrl' page by adding a small snippet of javascript to the user's 'logout' page.

Note that the store.js must be loaded.

```Javascript
  <script type="text/javascript">
    $(document).ready(function(){
      if (store.enabled) {
        store.set('idleTimerLoggedOut', true);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }
    });
  </script>
```
