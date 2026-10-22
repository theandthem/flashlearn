/*
 * Self-contained flashcard + quiz player for the SCORM package. Renders the deck
 * injected as window.DECK, scores the quiz client-side (the answer key ships with
 * the SCO, as is normal for SCORM), and reports results to the LMS via SCORM.
 */
(function () {
  var deck = window.DECK || { title: '', cards: [], questions: [] };
  var app = document.getElementById('app');
  var PASS_THRESHOLD = 0.7;

  SCORM.init();

  var state = { view: 'cards', cardIndex: 0, flipped: false, answers: {} };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    if (state.view === 'cards') renderCards();
    else if (state.view === 'quiz') renderQuiz();
    else renderScore();
  }

  function renderCards() {
    var card = deck.cards[state.cardIndex];
    var total = deck.cards.length;
    app.innerHTML =
      '<h1>' + esc(deck.title) + '</h1>' +
      '<div class="flip-scene">' +
        '<button type="button" id="card" class="flip-card' + (state.flipped ? ' is-flipped' : '') + '" aria-pressed="' + state.flipped + '" aria-label="Flip card">' +
          '<span class="flip-face">' +
            '<span class="question">' + esc(card.question) + '</span>' +
          '</span>' +
          '<span class="flip-face flip-face--back">' +
            '<span class="answer">' + esc(card.answer) + '</span>' +
            (card.explanation ? '<span class="explanation">' + esc(card.explanation) + '</span>' : '') +
          '</span>' +
        '</button>' +
      '</div>' +
      '<div class="controls">' +
        '<button type="button" id="prev"' + (state.cardIndex === 0 ? ' disabled' : '') + '>&larr; Prev</button>' +
        '<span class="progress">' + (state.cardIndex + 1) + ' / ' + total + '</span>' +
        '<button type="button" id="next"' + (state.cardIndex === total - 1 ? ' disabled' : '') + '>Next &rarr;</button>' +
      '</div>' +
      '<p class="progress">Click the card or press Space to flip; use &larr; &rarr; to move.</p>' +
      (deck.questions.length ? '<button type="button" id="start-quiz" class="primary">Start quiz &rarr;</button>' : '');

    byId('card').onclick = flip;
    var prev = byId('prev'); if (prev) prev.onclick = function () { navigate(-1); };
    var next = byId('next'); if (next) next.onclick = function () { navigate(1); };
    var start = byId('start-quiz'); if (start) start.onclick = function () { state.view = 'quiz'; render(); };
  }

  // Toggle the class on the existing element (not a re-render) so the CSS animates.
  function flip() {
    state.flipped = !state.flipped;
    var el = byId('card');
    if (el) {
      el.classList.toggle('is-flipped', state.flipped);
      el.setAttribute('aria-pressed', String(state.flipped));
    }
  }

  function navigate(delta) {
    var next = state.cardIndex + delta;
    if (next < 0 || next > deck.cards.length - 1) return;
    state.cardIndex = next;
    state.flipped = false;
    render();
  }

  function renderQuiz() {
    var html = '<h1>Quiz: ' + esc(deck.title) + '</h1><ol class="quiz">';
    deck.questions.forEach(function (q, qi) {
      html += '<li><fieldset><legend>' + esc(q.text) + '</legend>';
      q.options.forEach(function (opt, oi) {
        var id = 'q' + qi + 'o' + oi;
        html += '<label for="' + id + '"><input type="radio" id="' + id + '" name="q' + qi + '" value="' + oi + '"/> ' + esc(opt.text) + '</label>';
      });
      html += '</fieldset></li>';
    });
    html += '</ol><button type="button" id="submit" class="primary">Submit answers</button>';
    app.innerHTML = html;

    app.querySelectorAll('input[type=radio]').forEach(function (input) {
      input.onchange = function () {
        var qi = parseInt(input.name.slice(1), 10);
        state.answers[qi] = parseInt(input.value, 10);
      };
    });
    byId('submit').onclick = function () {
      if (Object.keys(state.answers).length < deck.questions.length) {
        alert('Please answer every question first.');
        return;
      }
      state.view = 'score';
      render();
    };
  }

  function renderScore() {
    var correct = 0;
    deck.questions.forEach(function (q, qi) {
      var chosen = state.answers[qi];
      var correctIndex = q.options.findIndex(function (o) { return o.correct; });
      var isCorrect = chosen === correctIndex;
      if (isCorrect) correct++;
      SCORM.reportInteraction(qi, 'q' + qi, String(chosen), String(correctIndex), isCorrect);
    });
    var total = deck.questions.length;
    SCORM.reportScore(correct, total, PASS_THRESHOLD);

    var pct = total ? Math.round((correct / total) * 100) : 0;
    var html = '<h1>Your score</h1><p class="score">' + pct + '%</p>' +
      '<p class="progress">' + correct + ' of ' + total + ' correct</p><ol class="quiz">';
    deck.questions.forEach(function (q, qi) {
      var chosen = state.answers[qi];
      var correctIndex = q.options.findIndex(function (o) { return o.correct; });
      var ok = chosen === correctIndex;
      html += '<li class="' + (ok ? 'ok' : 'bad') + '"><p>' + (ok ? '&#10003;' : '&#10007;') + ' ' + esc(q.text) + '</p>' +
        '<p class="small">Your answer: ' + esc(q.options[chosen] ? q.options[chosen].text : '—') + '</p>' +
        (ok ? '' : '<p class="small correct">Correct: ' + esc(q.options[correctIndex].text) + '</p>') + '</li>';
    });
    html += '</ol><button type="button" id="review" class="primary">Review flashcards</button>';
    app.innerHTML = html;
    byId('review').onclick = function () { state.view = 'cards'; state.cardIndex = 0; state.flipped = false; render(); };
  }

  function byId(id) { return document.getElementById(id); }

  // Keyboard shortcuts on the cards view: arrows to move, Space/Enter to flip.
  window.addEventListener('keydown', function (e) {
    if (state.view !== 'cards') return;
    if (e.key === 'ArrowRight') {
      navigate(1);
    } else if (e.key === 'ArrowLeft') {
      navigate(-1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      // Let a focused button handle its own activation; otherwise flip.
      if (e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        flip();
      }
    }
  });

  render();
})();
