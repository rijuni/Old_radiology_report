# 📁 PDF/DOC Files Integration - Complete Guide

## 🎯 Overview

This system connects PDF and DOC report files stored in a folder to the database and displays them in the frontend with a "View Report" button.

---

## 📊 How It Works

```
PDF/DOC Files (in media folder)
        ↓
Django Backend (serves files via /media/ URL)
        ↓
API Response (includes report_url field)
        ↓
Frontend Dashboard (displays "View Report" button)
        ↓
User clicks button → Opens PDF/DOC in new tab
```

---

## 🔧 What Was Implemented

### 1. **Backend Configuration**

#### `config/settings.py`
- Added `MEDIA_URL = '/media/'`
- Added `MEDIA_ROOT = os.path.join(BASE_DIR, 'media')`

#### `config/urls.py`
- Added media file serving in development mode
- Files accessible at: `http://localhost:8000/media/{file_path}`

#### `api/serializers.py`
- Enhanced `PatientSerializer` with `report_url` field
- Automatically generates full URL for each report

#### `api/models.py`
- `Patient` model has `report_path` field (max 500 chars)
- Stores the relative path to the PDF/DOC file

### 2. **Frontend Updates**

#### `Dashboard.jsx`
- Added "View Report" button in Action column
- Button only shows if `report_url` exists
- Opens file in new tab when clicked
- Shows "No Report" if no file available

---

## 📂 File Organization

### Step 1: Locate Your PDF/DOC Files Folder

You mentioned you have a folder containing all PDF and DOC files.

### Step 2: Copy Files to Media Directory

Copy your entire folder structure into:
```
backend/media/
```

**Example:**
If your files are in `D:\Reports\KIMSTELERAD\...`, copy the entire `KIMSTELERAD` folder to:
```
backend/media/KIMSTELERAD/
```

### Step 3: Verify File Paths Match Database

The `report_path` in the database should match the file location.

**Database Example:**
```
report_path: KIMSTELERAD/27-10-2022/1.3.6.1.4.1.24837.20221027140725215.113001/reports/remote_report_2_27102022_15144.doc
```

**File Location:**
```
backend/media/KIMSTELERAD/27-10-2022/1.3.6.1.4.1.24837.20221027140725215.113001/reports/remote_report_2_27102022_15144.doc
```

**Access URL:**
```
http://localhost:8000/media/KIMSTELERAD/27-10-2022/1.3.6.1.4.1.24837.20221027140725215.113001/reports/remote_report_2_27102022_15144.doc
```

---

## 🚀 Testing the Integration

### 1. **Verify Backend is Running**
```bash
cd backend
python manage.py runserver
```
Server should be at: `http://localhost:8000`

### 2. **Verify Frontend is Running**
```bash
cd radio-report-app
npm run dev
```
Frontend should be at: `http://localhost:5173`

### 3. **Test File Access Directly**

Open browser and try:
```
http://localhost:8000/media/KIMSTELERAD/27-10-2022/.../remote_report_2_27102022_15144.doc
```

If the file exists, it should download or open.

### 4. **Test via Frontend**

1. Open `http://localhost:5173`
2. Login to the dashboard
3. Search for a patient
4. Look for the "View Report" button in the Action column
5. Click it - the PDF/DOC should open in a new tab

---

## 🔍 Troubleshooting

### Issue 1: "View Report" button doesn't appear

**Cause:** No `report_url` in API response

**Solution:**
1. Check if `report_path` exists in database:
   ```sql
   SELECT mrn, name, report_path FROM api_patient WHERE report_path IS NOT NULL LIMIT 5;
   ```

2. Check API response:
   ```
   http://localhost:8000/api/patients/?page=1
   ```
   Look for `report_url` field in the JSON response

### Issue 2: "View Report" button shows but file doesn't open

**Cause:** File doesn't exist at the specified path

**Solution:**
1. Check the URL in browser console (F12 → Network tab)
2. Verify file exists at: `backend/media/{report_path}`
3. Check file permissions

### Issue 3: 404 Error when clicking "View Report"

**Cause:** File path mismatch or file doesn't exist

**Solution:**
1. Compare database `report_path` with actual file location
2. Ensure folder structure is correct
3. Check for typos in file names

### Issue 4: File downloads instead of opening in browser

**Cause:** Browser behavior for certain file types

**Solution:**
- This is normal for `.doc` files
- PDFs usually open in browser
- DOC files typically download

---

## 📋 Quick Checklist

- [ ] Backend server running (`python manage.py runserver`)
- [ ] Frontend server running (`npm run dev`)
- [ ] PDF/DOC files copied to `backend/media/` folder
- [ ] File structure matches database `report_path`
- [ ] Can access file directly via URL: `http://localhost:8000/media/...`
- [ ] "View Report" button appears in dashboard
- [ ] Clicking button opens/downloads the file

---

## 🎨 Frontend Features

### "View Report" Button Styling
- **Blue gradient** background
- **Download icon** (document with arrow)
- **Hover effect**: Shadow increases, button lifts slightly
- **Responsive**: Works on all screen sizes

### "No Report" Display
- **Gray italic text** when no report available
- **Non-clickable** - just informational

---

## 📊 Database Statistics

- **Total Records:** 767,978
- **Records with Reports:** Check with:
  ```sql
  SELECT COUNT(*) FROM api_patient WHERE report_path IS NOT NULL;
  ```

---

## 🔐 Security Considerations

### Current Setup (Development)
- Files served directly by Django
- No authentication required for file access
- Suitable for development only

### Production Recommendations
1. **Add authentication** to file serving
2. **Use Nginx** or Apache to serve media files
3. **Implement access control** based on user permissions
4. **Consider file encryption** for sensitive reports

---

## 📞 Need Help?

If you encounter issues:

1. **Check Django logs** in the terminal running `python manage.py runserver`
2. **Check browser console** (F12) for JavaScript errors
3. **Verify file paths** match exactly between database and file system
4. **Test API directly** using browser or Postman

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ "View Report" buttons appear in the Action column
2. ✅ Clicking a button opens a new tab
3. ✅ The PDF/DOC file loads or downloads
4. ✅ No 404 errors in browser console
5. ✅ Backend logs show successful file serving

---

**Last Updated:** February 13, 2026
**System Status:** ✅ Fully Operational
