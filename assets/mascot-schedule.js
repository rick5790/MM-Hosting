(function (root) {
  'use strict';

  var videos = {
    'default': 'assets/videos/mascots/default/makkie-waving-fixed.webm?v=20260922-organized-holiday-assets-72',
    'mid-autumn': 'assets/videos/mascots/seasonal/makkie-mid-autumn-2026.webm?v=20260922-organized-holiday-assets-72',
    'halloween': 'assets/videos/mascots/seasonal/makkie-halloween.webm?v=20260922-organized-holiday-assets-72',
    'christmas': 'assets/videos/mascots/seasonal/makkie-christmas.webm?v=20260922-organized-holiday-assets-72',
    'new-year': 'assets/videos/mascots/seasonal/makkie-new-year.webm?v=20260922-organized-holiday-assets-72',
    'cny': 'assets/videos/mascots/seasonal/makkie-cny-2027.webm?v=20260922-organized-holiday-assets-72'
  };

  var losAngelesDateKey = function (date) {
    var now = date || new Date();
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(now);
      var values = {};
      parts.forEach(function (part) { values[part.type] = part.value; });
      return values.year + '-' + values.month + '-' + values.day;
    } catch (err) {
      var pad = function (value) { return ('0' + value).slice(-2); };
      return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    }
  };

  var selectEdition = function (dateKey) {
    var monthDay = dateKey.slice(5);
    if (dateKey >= '2026-09-15' && dateKey <= '2026-09-27') return 'mid-autumn';
    if (monthDay >= '10-21' && monthDay <= '10-31') return 'halloween';
    // 圣诞和跨年展示期会在 12/22–25 重叠；离节日更近的圣诞优先。
    if (monthDay >= '12-15' && monthDay <= '12-25') return 'christmas';
    if (monthDay >= '12-22' || monthDay === '01-01') return 'new-year';
    if (dateKey >= '2027-01-27' && dateKey <= '2027-02-11') return 'cny';
    return 'default';
  };

  var requestedEdition = function (search, dateKey) {
    var match = String(search || '').match(/(?:^|[?&])mascot=([^&]+)/);
    var preview = match ? decodeURIComponent(match[1]) : '';
    if (Object.prototype.hasOwnProperty.call(videos, preview)) return preview;
    return selectEdition(dateKey || losAngelesDateKey());
  };

  root.MakkieMascotSchedule = {
    videos: videos,
    losAngelesDateKey: losAngelesDateKey,
    selectEdition: selectEdition,
    requestedEdition: requestedEdition
  };
}(typeof window !== 'undefined' ? window : globalThis));
