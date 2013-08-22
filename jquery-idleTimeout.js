/**
 * This work is licensed under the Creative Commons Attribution-Share Alike 3.0
 * United States License. To view a copy of this license,
 * visit http://creativecommons.org/licenses/by-sa/3.0/us/ or send a letter
 * to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA
 *
 * Configurable idle (no activity) timer and logout redirect for jQuery.
 * Works cross-browser with multiple windows and tabs within the same domain.
 *
 * Dependencies: JQuery v1.7+, JQuery UI, store.js from https://github.com/marcuswestin/store.js - v1.3.4+
 * v1.0.3
 */

(function($) {

  $.fn.idleTimeout = function(options) {
    //##############################
    //## Configuration Variables
    //##############################
    var defaults = {
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
    };

    //##############################
    //## Private Variables
    //##############################
    var opts = $.extend(defaults, options);
    var idleTimer, dialogTimer, idleTimerLastActivity;
    var checkHeartbeat = 2000; // frequency to check for timeouts - 2000 = 2 seconds.

    //##############################
    //## Private Functions
    //##############################

    var openWarningDialog = function() {
      var dialogContent = "<div id='idletimer_warning_dialog'><p>" + opts.dialogText + "</p></div>";

      var warningDialog = $(dialogContent).dialog({
        buttons: {
          "Stay Logged In": function() {
            destroyWarningDialog();
            stopDialogTimer();
            startIdleTimer();
          },
          "Log Out Now": function() {
            logoutUser();
          }
        },
        closeOnEscape: false,
        modal: true,
        title: opts.dialogTitle
      });

      // hide the dialog's upper right corner "x" close button
      $('.ui-dialog-titlebar-close').css('display', 'none');
    };

    var isDialogOpen = function() {
      var dialogOpen = $('#idletimer_warning_dialog').dialog('isOpen');

      if (dialogOpen === true) {
        return true;
      } else {
        return false;
      }
    };

    var destroyWarningDialog = function() {
      $(".ui-dialog-content").dialog('destroy').remove();
    };

    var checkIdleTimeout = function() {
      var timeNow = $.now();
      var timeIdleTimeout = (store.get('idleTimerLastActivity') + opts.idleTimeLimit);

      if (timeNow > timeIdleTimeout) {
        if (isDialogOpen() !== true) {
          openWarningDialog();
          startDialogTimer();
        }
      } else if (store.get('idleTimerLoggedOut') === true) { //a 'manual' user logout?
        logoutUser();
      } else {
        if (isDialogOpen() === true) {
          destroyWarningDialog();
          stopDialogTimer();
        }
      }
    };

    var startIdleTimer = function() {
      stopIdleTimer();
      idleTimerLastActivity = $.now();
      store.set('idleTimerLastActivity', idleTimerLastActivity);
      idleTimer = setInterval(checkIdleTimeout, checkHeartbeat);
    };

    var stopIdleTimer = function() {
      clearInterval(idleTimer);
    };

    var checkDialogTimeout = function() {
      var timeNow = $.now();
      var timeDialogTimeout = (store.get('idleTimerLastActivity') + opts.idleTimeLimit + opts.dialogDisplayLimit);

      if ((timeNow > timeDialogTimeout) || (store.get('idleTimerLoggedOut') === true)) {
        logoutUser();
      }
    };

    var startDialogTimer = function() {
      dialogTimer = setInterval(checkDialogTimeout, checkHeartbeat);
    };

    var stopDialogTimer = function() {
      clearInterval(dialogTimer);
    };

    var logoutUser = function() {
      store.set('idleTimerLoggedOut', true);

      if (opts.customCallback) {
        opts.customCallback();
      }

      if (opts.redirectUrl) {
        window.location.href = opts.redirectUrl;
      }
    };

    var activityDetector = function() {

      $('body').on(opts.activityEvents, function() {

        if (isDialogOpen() !== true) {
          startIdleTimer();
        }
      });
    };

    var keepSessionAlive = function() {

      if (opts.sessionKeepAliveTimer) {
        var keepSession = function() {
          if (idleTimerLastActivity === store.get('idleTimerLastActivity')) {
            $.get(opts.sessionKeepAliveUrl);
          }
        };

        setInterval(keepSession, opts.sessionKeepAliveTimer);
      }
    };

    //###############################
    // Build & Return the instance of the item as a plugin
    // This is your construct.
    //###############################
    return this.each(function() {

      if (store.enabled) {
        idleTimerLastActivity = $.now();
        store.set('idleTimerLastActivity', idleTimerLastActivity);
        store.set('idleTimerLoggedOut', false);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }

      activityDetector();

      keepSessionAlive();

      startIdleTimer();
    });
  }
})(jQuery);
