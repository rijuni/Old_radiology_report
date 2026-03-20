from django.contrib import admin
from .models import User, Patient, UserSession

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active')

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'mrn', 'accession_no', 'exam_date', 'service_status')
    search_fields = ('name', 'mrn', 'accession_no')

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'login_time', 'logout_time', 'ip_address')
