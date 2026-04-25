/**
 * WarmStudy - Unified API Request Tool
 * Backend: https://wsapi.supermoxi.top
 *
 * Keep this file ES5-compatible for miniapp upload validators.
 */

var DEFAULT_API_BASE = 'https://wsapi.supermoxi.top';

function getApiBase() {
  var app = typeof getApp === 'function' ? getApp() : null;
  return (app && app.globalData && app.globalData.apiBase) || DEFAULT_API_BASE;
}

function mergeObjects(base, extra) {
  var result = {};
  var key;

  base = base || {};
  extra = extra || {};

  for (key in base) {
    if (Object.prototype.hasOwnProperty.call(base, key)) {
      result[key] = base[key];
    }
  }

  for (key in extra) {
    if (Object.prototype.hasOwnProperty.call(extra, key)) {
      result[key] = extra[key];
    }
  }

  return result;
}

function pad2(value) {
  value = String(value);
  return value.length >= 2 ? value : '0' + value;
}

function request(url, data, method) {
  method = method || 'POST';

  return new Promise(function (resolve, reject) {
    wx.request({
      url: getApiBase() + url,
      data: data,
      method: method,
      header: { 'Content-Type': 'application/json' },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          var body = res.data || {};
          reject(new Error(body.error || body.message || ('请求失败: ' + res.statusCode)));
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function loginByPhone(phone, code, role) {
  return request('/api/auth/login/phone', { phone: phone, code: code, role: role });
}

function loginByWechat(wxCode, role) {
  return request('/api/auth/login/wechat', { wx_code: wxCode, role: role });
}

function sendVerifyCode(phone) {
  return request('/api/auth/send-code', { phone: phone });
}

function studentChat(userId, message, options) {
  options = options || {};
  return request('/api/student/chat', {
    user_id: userId,
    message: message,
    session_id: options.sessionId,
    profile: options.profile
  });
}

function updateStudentProfile(userId, profile) {
  return request('/api/student/profile', mergeObjects({ user_id: userId }, profile));
}

function submitCheckin(userId, data) {
  return request('/api/student/checkin', mergeObjects({ user_id: userId }, data));
}

function submitPsychTest(userId, answers, testType) {
  testType = testType || 'weekly';
  return request('/api/student/psych/test', {
    user_id: userId,
    answers: answers,
    test_type: testType
  });
}

function getPsychStatus(userId) {
  return request('/api/student/psych/status/' + userId, undefined, 'GET');
}

function getCheckinHistory(userId, days) {
  days = days || 7;
  return request('/api/student/checkin/' + userId + '?days=' + days, undefined, 'GET');
}

function parentChat(userId, message, options) {
  options = options || {};
  return request('/api/parent/chat', {
    user_id: userId,
    message: message,
    session_id: options.sessionId,
    child_id: options.childId
  });
}

function getChildStatus(childId) {
  return request('/api/parent/child/' + childId + '/status', undefined, 'GET');
}

function getChildCheckins(childId, days) {
  days = days || 7;
  return request('/api/parent/child/' + childId + '/checkins?days=' + days, undefined, 'GET');
}

function getDailyAdvice(childId) {
  return request('/api/parent/child/' + childId + '/ai_advice', undefined, 'GET');
}

function getChildComprehensiveReport(childId) {
  return request('/api/parent/child/' + childId + '/summary_report', undefined, 'GET');
}

function submitGrade(userId, subject, score, examDate) {
  return request('/api/parent/child/grade', {
    user_id: userId,
    subject: subject,
    score: score,
    exam_date: examDate
  });
}

function parentLogin(phone) {
  return request('/api/parent/login', { phone: phone });
}

function getChildrenProfiles(childIds) {
  return request('/api/parent/children/profiles', { child_ids: childIds.join(',') });
}

function getParentQRToken(parentId) {
  return request('/api/parent/qr_token', { parent_id: parentId });
}

function bindChild(parentId, childId) {
  return request('/api/parent/child/bind', { parent_id: parentId, child_id: childId });
}

function getCurrentTime() {
  var now = new Date();
  return pad2(now.getHours()) + ':' + pad2(now.getMinutes());
}

function getCurrentDate() {
  var now = new Date();
  return now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
}

function getUserId(role) {
  role = role || 'student';
  var key = role === 'student' ? 'student_user_id' : 'parent_user_id';
  if (role === 'student') {
    return ensureStudentId();
  }
  return wx.getStorageSync(key) || wx.getStorageSync('user_id') || '';
}

function getCurrentUserId() {
  return wx.getStorageSync('user_id') || '';
}

function getCurrentRole() {
  return wx.getStorageSync('user_role') || '';
}

function getParentId() {
  var account = wx.getStorageSync('parent_account') || {};
  return wx.getStorageSync('parent_user_id') || account.parent_id || account.id || wx.getStorageSync('user_id') || '';
}

function getChildId() {
  return wx.getStorageSync('bound_child_id') || '';
}

function isValidStudentId(childId) {
  return /^\d{9}$/.test(String(childId || '').trim());
}

function ensureStudentId() {
  var existing =
    wx.getStorageSync('student_user_id') ||
    (wx.getStorageSync('user_role') === 'student' ? wx.getStorageSync('user_id') : '');

  if (isValidStudentId(existing)) {
    wx.setStorageSync('student_user_id', existing);
    wx.setStorageSync('student_id', existing);
    return existing;
  }

  var generated = String(Math.floor(100000000 + Math.random() * 900000000));
  wx.setStorageSync('student_user_id', generated);
  wx.setStorageSync('student_id', generated);
  if (!wx.getStorageSync('user_id')) {
    wx.setStorageSync('user_id', generated);
    wx.setStorageSync('user_role', 'student');
  }
  return generated;
}

function bindParentByToken(token, childId) {
  return request('/api/child/bind', { token: token, child_id: childId });
}

function getChildPsychReports(childId, limit) {
  limit = limit || 5;
  return request('/api/parent/child/' + childId + '/psych_reports?limit=' + limit, undefined, 'GET');
}

function getChildPsychStatus(childId) {
  return request('/api/parent/child/' + childId + '/psych/latest', undefined, 'GET');
}

function getParentAlerts(parentId, limit, offset) {
  limit = limit || 20;
  offset = offset || 0;
  return request(
    '/api/parent/alerts?parent_id=' + parentId + '&limit=' + limit + '&offset=' + offset,
    undefined,
    'GET'
  );
}

function markAlertRead(alertId, parentId) {
  return request('/api/parent/alerts/' + alertId + '/read', { parent_id: parentId });
}

function markAllAlertsRead(parentId) {
  return request('/api/parent/alerts/read_all', { parent_id: parentId });
}

function getChildPsychReportDetail(reportId) {
  return request('/api/parent/report/' + reportId, undefined, 'GET');
}

module.exports = {
  loginByPhone: loginByPhone,
  loginByWechat: loginByWechat,
  sendVerifyCode: sendVerifyCode,
  studentChat: studentChat,
  updateStudentProfile: updateStudentProfile,
  submitCheckin: submitCheckin,
  submitPsychTest: submitPsychTest,
  getPsychStatus: getPsychStatus,
  getCheckinHistory: getCheckinHistory,
  parentChat: parentChat,
  getChildStatus: getChildStatus,
  getChildCheckins: getChildCheckins,
  getDailyAdvice: getDailyAdvice,
  getChildComprehensiveReport: getChildComprehensiveReport,
  submitGrade: submitGrade,
  parentLogin: parentLogin,
  getChildrenProfiles: getChildrenProfiles,
  getParentQRToken: getParentQRToken,
  bindChild: bindChild,
  getCurrentTime: getCurrentTime,
  getCurrentDate: getCurrentDate,
  getUserId: getUserId,
  getCurrentUserId: getCurrentUserId,
  getCurrentRole: getCurrentRole,
  getParentId: getParentId,
  getChildId: getChildId,
  isValidStudentId: isValidStudentId,
  ensureStudentId: ensureStudentId,
  bindParentByToken: bindParentByToken,
  getChildPsychReports: getChildPsychReports,
  getChildPsychStatus: getChildPsychStatus,
  getParentAlerts: getParentAlerts,
  markAlertRead: markAlertRead,
  markAllAlertsRead: markAllAlertsRead,
  getChildPsychReportDetail: getChildPsychReportDetail
};
