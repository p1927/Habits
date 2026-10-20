// ---------- ADDED: WhatsApp / email activity -> Relationships doc + Calendar ----------
var MONTHS_ = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
// Finds an explicit "10 Oct" style date (and optional "11:00" / "11am") in a chat snippet. Returns null if none.
function chatWhen_(text) {
  var s = String(text || "");
  var d = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i);
  if (!d) { return null; }
  var now = new Date();
  var day = Number(d[1]), mon = MONTHS_[d[2].toLowerCase()];
  if (day < 1 || day > 31) { return null; }
  var hh = null, mm = 0;
  var t = s.match(/\b(\d{1,2}):(\d{2})\b/);
  var t2 = s.match(/\b(\d{1,2})\s*(am|pm)\b/i);
  if (t) { hh = Number(t[1]); mm = Number(t[2]); }
  else if (t2) { hh = Number(t2[1]) % 12 + (t2[2].toLowerCase() === "pm" ? 12 : 0); }
  if (hh !== null && (hh > 23 || mm > 59)) { hh = null; mm = 0; }
  var when = new Date(now.getFullYear(), mon, day, hh === null ? 0 : hh, mm);
  if (when.getTime() < now.getTime() - 86400000) { when = new Date(now.getFullYear() + 1, mon, day, hh === null ? 0 : hh, mm); }
  return { date: when, hasTime: hh !== null };
}
// Creates a Calendar event for chat messages that mention a concrete date. De-duplicated, logged in the Log tab.
function scheduleFromChats_(list) {
  var seen = [];
  try { seen = JSON.parse(props_().getProperty("CHATEVT") || "[]"); } catch (e) { seen = []; }
  var cal = CalendarApp.getDefaultCalendar();
  list.forEach(function (i) {
    var segs = String(i.summary || "").split(" || "), seg = ""; for (var q = segs.length - 1; q >= 0; q--) { if (chatWhen_(segs[q])) { seg = segs[q]; break; } } var w = seg ? chatWhen_(seg) : null;
    if (!w) { return; }
    var name = String(i.name || "").trim() || "chat";
    var key = name.toLowerCase() + "@" + fmt_(w.date, w.hasTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd");
    if (seen.indexOf(key) >= 0) { return; }
    seen.push(key);
    var title = "[" + (i.channel || "chat") + "] " + name + ": " + seg.replace(/\s+/g, " ").slice(0, 70);
    if (w.hasTime) { cal.createEvent(title, w.date, new Date(w.date.getTime() + 3600000)); }
    else { cal.createAllDayEvent(title, w.date); }
    appendRow_("Log", { time: fmt_(new Date(), "yyyy-MM-dd HH:mm"), task: "scheduleFromChats", status: "event", detail: key });
  });
  props_().setProperty("CHATEVT", JSON.stringify(seen.slice(-100)));
}
// Rewrites section 5 of the Relationships doc from the Contacts tab (WhatsApp, email). Everything above section 5 is left alone.
function syncRelationships_() {
  var doc = DocumentApp.openById(CFG.relationshipsDocId);
  var body = doc.getBody();
  var title = "5. Auto-Synced Activity (WhatsApp and Email)";
  var idx = -1, n = body.getNumChildren();
  for (var i = 0; i < n; i++) {
    var el = body.getChild(i);
    if (el.getType() === DocumentApp.ElementType.PARAGRAPH && el.asParagraph().getText() === title) { idx = i; break; }
  }
  if (idx < 0) {
    body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    idx = body.getNumChildren() - 1;
  }
  for (var j = body.getNumChildren() - 1; j > idx; j--) { try { body.removeChild(body.getChild(j)); } catch (eRm) {} } var tailP = null; if (body.getNumChildren() > idx + 1 && body.getChild(idx + 1).getType() === DocumentApp.ElementType.PARAGRAPH) { tailP = body.getChild(idx + 1).asParagraph(); tailP.setHeading(DocumentApp.ParagraphHeading.NORMAL); } var put_ = function (text) { if (tailP) { tailP.setText(text); tailP = null; } else { body.appendParagraph(text); } };
  var rows = readTab_("Contacts").filter(function (r) { return r.name && String(r.circle) !== "Ignore" && r.last_contact; });
  rows.sort(function (a, b) { return String(fmt_(toDate_(b.last_contact) || new Date(0), "yyyy-MM-dd")).localeCompare(String(fmt_(toDate_(a.last_contact) || new Date(0), "yyyy-MM-dd"))); });
  var owed = rows.filter(function (r) { return r.last_msg_from === "them"; }).map(function (r) { return r.name; });
  var bd = birthdays_(30).map(function (b) { return b.name + " (in " + b.days + " days)"; });
  put_("Updated automatically " + fmt_(new Date(), "yyyy-MM-dd HH:mm") + ". Do not edit this section; it is rewritten every run.");
  put_("Reply owed (they messaged last): " + (owed.length ? owed.join(", ") : "none"));
  put_("Birthdays in the next 30 days: " + (bd.length ? bd.join(", ") : "none"));
  put_("Recent activity (newest first):");
  rows.slice(0, 25).forEach(function (r) {
    var line = r.name + " | " + (r.circle || "Unsorted") + " | " + fmt_(toDate_(r.last_contact) || new Date(), "yyyy-MM-dd") + " via " + (r.last_channel || "?") + " | " + (r.last_msg_from === "them" ? "they spoke last" : "I spoke last");
    if (r.last_summary) { line += " | " + String(r.last_summary).slice(0, 400); }
    if (r.notes) { line += " | notes: " + String(r.notes).slice(0, 120); }
    put_(line);
  });
  doc.saveAndClose();
}

