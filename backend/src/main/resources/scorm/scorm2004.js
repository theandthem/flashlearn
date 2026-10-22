/*
 * Minimal SCORM 2004 run-time adapter. Locates the LMS API (API_1484_11) by
 * walking up the window hierarchy, then exposes helpers for completion, score,
 * interactions and session time. Degrades gracefully to a no-op when no LMS is
 * present (e.g. previewing the SCO outside an LMS).
 */
(function (global) {
  var api = null;
  var startTs = 0;

  function findAPI(win) {
    var tries = 0;
    while (win && !win.API_1484_11 && win.parent && win.parent !== win && tries < 500) {
      tries += 1;
      win = win.parent;
    }
    return win ? win.API_1484_11 : null;
  }

  function locateAPI() {
    var found = findAPI(window);
    if (!found && window.opener) {
      found = findAPI(window.opener);
    }
    return found || null;
  }

  function toISODuration(totalSeconds) {
    var h = Math.floor(totalSeconds / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = totalSeconds % 60;
    return 'PT' + (h ? h + 'H' : '') + (m ? m + 'M' : '') + s + 'S';
  }

  var SCORM = {
    available: false,

    init: function () {
      api = locateAPI();
      if (!api) return false;
      this.available = api.Initialize('') === 'true';
      if (this.available) {
        startTs = Date.now();
        var status = api.GetValue('cmi.completion_status');
        if (status === '' || status === 'unknown') {
          api.SetValue('cmi.completion_status', 'incomplete');
        }
        api.Commit('');
      }
      return this.available;
    },

    reportScore: function (correct, total, passThreshold) {
      if (!this.available) return;
      var scaled = total > 0 ? correct / total : 0;
      api.SetValue('cmi.score.min', '0');
      api.SetValue('cmi.score.max', String(total));
      api.SetValue('cmi.score.raw', String(correct));
      api.SetValue('cmi.score.scaled', scaled.toFixed(4));
      api.SetValue('cmi.completion_status', 'completed');
      api.SetValue('cmi.success_status', scaled >= passThreshold ? 'passed' : 'failed');
      api.Commit('');
    },

    reportInteraction: function (index, id, learnerResponse, correctResponse, isCorrect) {
      if (!this.available) return;
      var p = 'cmi.interactions.' + index + '.';
      api.SetValue(p + 'id', id);
      api.SetValue(p + 'type', 'choice');
      api.SetValue(p + 'learner_response', learnerResponse);
      api.SetValue(p + 'correct_responses.0.pattern', correctResponse);
      api.SetValue(p + 'result', isCorrect ? 'correct' : 'incorrect');
      api.Commit('');
    },

    terminate: function () {
      if (!this.available) return;
      var secs = Math.floor((Date.now() - startTs) / 1000);
      api.SetValue('cmi.session_time', toISODuration(secs));
      api.Commit('');
      api.Terminate('');
      this.available = false;
    }
  };

  // Persist the attempt when the SCO is closed/navigated away from.
  window.addEventListener('pagehide', function () {
    SCORM.terminate();
  });

  global.SCORM = SCORM;
})(window);
