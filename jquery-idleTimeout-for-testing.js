//######
//## This work is licensed under the Creative Commons Attribution-Share Alike 3.0
//## United States License. To view a copy of this license,
//## visit http://creativecommons.org/licenses/by-sa/3.0/us/ or send a letter
//## to Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.
//######

// Dependency: https://github.com/marcuswestin/store.js - version 1.3.4+

// Thanks to https://github.com/philpalmieri/jquery-idleTimeout & https://github.com/josebalius/jquery-idleTimeout
// Modified By: Jill Elaine
// Email: jillelaine01(at)gmail(dot)com

// version 1.0.2
// Comments and Console logs for debugging with Firefox & Firebug


(function($) {

  $.fn.idleTimeout = function(options) {
    console.log('start');
    //##############################
    //## Configuration Variables
    //##############################
    var defaults = {
      //idleTimeLimit:      1200000,        // 'No activity' time limit in milliseconds. 1200000 = 20 Minutes
      idleTimeLimit:        30000,          // 30 seconds for testing
      //dialogDisplayLimit: 180000,         // Time to display the warning dialog before redirect (and optional callback) in milliseconds. 180000 = 3 Minutes
      dialogDisplayLimit:   20000,          // 20 seconds for testing
      redirectUrl:          '/logout',      // redirect to this url

      // optional custom callback to perform before redirect
      customCallback:       false,          // set to false for no customCallback
      // customCallback:    function() {    // define optional custom js function
          // User to be logged out, perform custom action
      // },

      // configure which activity events to detect
      // http://www.quirksmode.org/dom/events/
      // https://developer.mozilla.org/en-US/docs/Web/Reference/Events
      // JQuery on() method (v1.7+) expects a 'space-separated' string of event names
      // activityEvents:       'click keypress scroll wheel mousewheel mousemove', // separate each event with a space
      activityEvents:       'click keypress scroll wheel mousewheel', // customize events for testing - remove mousemove

      //dialog box configuration
      dialogTitle:          'Session Expiration Warning',
      dialogText:           'Because you have been inactive, your session is about to expire.',

      // server-side session keep-alive timer & url
      sessionKeepAliveTimer: 60000, // Ping the server at this interval in milliseconds. 60000 = 1 Minute
      // sessionKeepAliveTimer: false, // Set to false to disable pings.
      sessionKeepAliveUrl:   '/', // url to ping
    };

    //##############################
    //## Private Variables
    //##############################
    var opts = $.extend(defaults, options);
    var idleTimer, dialogTimer, idleTimerLastActivity;
    var checkHeartbeat = 2000; // frequency to check for timeouts

    //##############################
    //## Private Functions
    //##############################

    // open warning dialog function
    var open_warning_dialog = function() {
      var dialogContent = "<div id='idletimer_warning_dialog'><p>" + opts.dialogText + "</p></div>";

      var warningDialog = $(dialogContent).dialog({
        buttons: {
          "Stay Logged In": function() {
            console.log('Stay Logged In button clicked');
            destroy_warning_dialog();
            stop_dialog_timer();
            start_idle_timer();
          },
          "Log Out Now": function() {
            console.log('Log Out Now button clicked');
            logout_user();
          }
        },
        closeOnEscape: false,
        modal: true,
        title: opts.dialogTitle
      });

      // hide the dialog's upper right corner "x" close button
      $('.ui-dialog-titlebar-close').css('display', 'none');
    };

    // is dialog open function
    var is_dialog_open = function() {
      var dialogOpen = $('#idletimer_warning_dialog').dialog('isOpen');

      if (dialogOpen === true) {
        return true;
      } else {
        return false;
      }
    };

    // destroy warning dialog function
    var destroy_warning_dialog = function() {
      console.log('dialog destroyed');
      $(".ui-dialog-content").dialog('destroy').remove();
    };

    // check idle timeout function
    var checkIdleTimeout = function() {
      var timeNow = $.now();
      var timeIdleTimeout = (store.get('idleTimerLastActivity') + opts.idleTimeLimit);

      if (timeNow > timeIdleTimeout) {
        console.log('timeNow: ' + timeNow + ' > idle ' + timeIdleTimeout);
        if (is_dialog_open() !== true) {
          console.log('dialog is not open & will be opened');
          open_warning_dialog();
          start_dialog_timer();
        }
      } else if (store.get('idleTimerLoggedOut') === true) { //a 'manual' user logout?
        logout_user();
      } else {
        console.log('idle not yet timed out');
        if (is_dialog_open() === true) {
          console.log('dialog is open & will be closed');
          destroy_warning_dialog();
          stop_dialog_timer();
        }
      }
    };

    // start idle timer function
    var start_idle_timer = function() {
      stop_idle_timer();
      idleTimerLastActivity = $.now();

      store.set('idleTimerLastActivity', idleTimerLastActivity);
      console.log('start idle timer: ' + idleTimerLastActivity);

      idleTimer = setInterval(checkIdleTimeout, checkHeartbeat);
    };

    // stop idle timer function
    var stop_idle_timer = function() {
      clearInterval(idleTimer);
    };

    // check dialog timeout function
    var checkDialogTimeout = function() {
      var timeNow = $.now();
      var timeDialogTimeout = (store.get('idleTimerLastActivity') + opts.idleTimeLimit + opts.dialogDisplayLimit);

      if ((timeNow > timeDialogTimeout) || (store.get('idleTimerLoggedOut') === true)) {
        console.log('timeNow: ' + timeNow + ' > dialog' + timeDialogTimeout);
        logout_user();
      } else {
        console.log('dialog not yet timed out');
      }
    };

    // start dialog timer function
    var start_dialog_timer = function() {
      dialogTimer = setInterval(checkDialogTimeout, checkHeartbeat);
    };

    // stop dialog timer function
    var stop_dialog_timer = function() {
      clearInterval(dialogTimer);
    };

    // perform logout procedure function
    var logout_user = function() {
      console.log('logout function');
      store.set('idleTimerLoggedOut', true);

      if (opts.customCallback) {
        console.log('custom callback');
        opts.customCallback();
      }

      if (opts.redirectUrl) {
        window.location.href = opts.redirectUrl;
      }
    };

    // activity detector function
    // if warning dialog is NOT open, restarts idle timer
    var activity_detector = function() {

      $('body').on(opts.activityEvents, function() {

        if (is_dialog_open() !== true) {
          console.log('activity detected');
          start_idle_timer();
        } else {
          console.log('dialog open. activity ignored');
        }

      });
    };

    // if keep-alive sessionKeepAliveTimer value is not false,
    // ping the server at regular intervals to prevent a server idle timeout
    var keep_session_alive = function() {

      if (opts.sessionKeepAliveTimer) {
        var keep_session = function() {
          // if this is the most recently active window or tab
          if (idleTimerLastActivity == store.get('idleTimerLastActivity')) {
            console.log('keep session alive function');
            $.get(opts.sessionKeepAliveUrl);
          }
        };

        setInterval(keep_session, opts.sessionKeepAliveTimer);
      }
    };

    //###############################
    // Build & Return the instance of the item as a plugin
    // This is basically your construct.
    //###############################
    return this.each(function() {
      console.log('instance started');

      if (store.enabled) {
        // initial values
        idleTimerLastActivity = $.now();
        store.set('idleTimerLastActivity', idleTimerLastActivity);
        store.set('idleTimerLoggedOut', false);
      } else {
        alert('Dependent file missing. Please see: https://github.com/marcuswestin/store.js');
      }

      activity_detector();

      keep_session_alive();

      start_idle_timer();
    });
  }
})(jQuery);
