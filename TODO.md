# Fix Plan

## 1. Core Components
- [x] `src/components/AppButton.js` — Add `loading` prop with ActivityIndicator inside button
- [x] `src/components/FormFields.js` — Left as restored by user (original state preserved)

## 2. CSV Export Fix
- [x] `src/services/exportService.js` — Added UTF-8 BOM; made web download robust (link.click + dispatchEvent fallback); on native, export now uses Sharing.shareAsync so the file is actually accessible

## 3. Login / Register UX
- [x] `src/app/login.js` — Uses AppButton `loading={isSubmitting}`; removed separate ActivityIndicator
- [x] `src/app/register.js` — Uses AppButton `loading={isSubmitting}`; fixed dependent error clearing when Faculty/Programmes change; removed separate ActivityIndicator

## 4. Other Action Screens
- [x] `src/app/reports.js` — Uses AppButton `loading` for CSV buttons and Save Feedback; removed separate ActivityIndicator
- [x] `src/app/report-form.js` — Uses AppButton `loading={saving}`
- [x] `src/app/attendance.js` — Uses AppButton `loading` for save and delete
- [x] `src/app/course-form.js` — Uses AppButton `loading={saving}`
- [x] `src/app/ratings.js` — Uses AppButton `loading` for submit and delete

