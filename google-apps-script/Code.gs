var DOCUMENT_TITLE = 'Treasure Hunt Submissions';
var ACCEPTED_ANSWERS = {
  'First Hint': ['management', 'management department', 'management block', 'school of management', 'department of management'],
  'Second Hint': ['taaza tiffins', 'taaza', 'tiffins', 'taza tiffins'],
  'Hint D': ["domino's", 'dominos', 'domino'],
  'Hint E': ['country oven', 'countryoven'],
  'Hint F': ['nescafe', 'nescafé'],
  'Hint G': ['stadium', 'institute stadium', 'finish', 'base']
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    validate_(data);
    if (!isCorrectAnswer_(data.hint, data.answer)) {
      return response_({ ok: true, recorded: false });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (alreadyRecorded_(data.eventId)) {
        return response_({ ok: true, duplicate: true });
      }

      var doc = getDocument_();
      var body = doc.getBody();
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss z');
      body.appendParagraph(timestamp + ' | ' + clean_(data.teamName) + ' | ' + clean_(data.hint))
        .setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('Answer: ' + clean_(data.answer));
      body.appendHorizontalRule();
      doc.saveAndClose();

      PropertiesService.getScriptProperties().setProperty('event:' + data.eventId, timestamp);
      return response_({ ok: true });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return response_({ ok: false, error: String(error.message || error) });
  }
}

function setup() {
  var existingId = PropertiesService.getScriptProperties().getProperty('DOCUMENT_ID');
  if (existingId) {
    return showDocumentUrl();
  }

  var doc = DocumentApp.create(DOCUMENT_TITLE);
  doc.getBody().appendParagraph('Treasure Hunt Submissions')
    .setHeading(DocumentApp.ParagraphHeading.TITLE);
  doc.saveAndClose();
  PropertiesService.getScriptProperties().setProperty('DOCUMENT_ID', doc.getId());
  return logDocumentUrl_(doc.getUrl());
}

// Run this function at any time to print the URL of the registered document.
function showDocumentUrl() {
  return logDocumentUrl_(getDocument_().getUrl());
}

function logDocumentUrl_(url) {
  var message = 'Submission document: ' + url;
  Logger.log(message);
  console.log(message);
  return url;
}

function getDocument_() {
  var id = PropertiesService.getScriptProperties().getProperty('DOCUMENT_ID');
  if (!id) throw new Error('Run setup() once before deploying the web app.');
  return DocumentApp.openById(id);
}

function alreadyRecorded_(eventId) {
  return !!PropertiesService.getScriptProperties().getProperty('event:' + eventId);
}

function validate_(data) {
  if (!data.eventId || !data.teamName || !data.hint || !data.answer) {
    throw new Error('Missing required submission fields.');
  }
  if (data.event !== 'answer_submitted' || data.correct !== true) {
    throw new Error('Only correct answer submissions are accepted.');
  }
  if (String(data.teamName).length > 100 || String(data.answer || '').length > 500) {
    throw new Error('Submission is too long.');
  }
}

function isCorrectAnswer_(hint, answer) {
  var normalizedAnswer = normalize_(answer);
  var accepted = ACCEPTED_ANSWERS[String(hint)] || [];
  return accepted.some(function(candidate) {
    return normalizedAnswer.indexOf(normalize_(candidate)) !== -1;
  });
}

function normalize_(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function clean_(value) {
  return String(value == null ? '' : value).replace(/[\r\n]+/g, ' ').trim();
}

function response_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
