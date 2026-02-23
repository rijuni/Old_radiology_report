# Media Files Directory

This directory contains all the PDF and DOC report files for the radiology system.

## Directory Structure

Place your PDF/DOC files in this directory following the same structure as stored in the database `report_path` field.

For example, if the database has:
```
report_path: KIMSTELERAD/27-10-2022/1.3.6.1.4.1.24837.20221027140725215.113001/reports/remote_report_2_27102022_15144.doc
```

The file should be located at:
```
backend/media/KIMSTELERAD/27-10-2022/1.3.6.1.4.1.24837.20221027140725215.113001/reports/remote_report_2_27102022_15144.doc
```

## How to Add Files

1. Copy your entire folder of PDF/DOC files into this `media` directory
2. Ensure the folder structure matches the paths in the database
3. The files will be automatically accessible via the API

## Access URLs

Files will be accessible at:
```
http://localhost:8000/media/{report_path}
```

For example:
```
http://localhost:8000/media/KIMSTELERAD/27-10-2022/1.3.6.1.4.1.24837.20221027140725215.113001/reports/remote_report_2_27102022_15144.doc
```

## Important Notes

- Make sure file permissions allow the Django server to read the files
- Supported formats: PDF, DOC, DOCX
- Files are served directly by Django in development mode
- For production, consider using a web server like Nginx to serve media files
