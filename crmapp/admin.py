from django.contrib import admin
from .models import StudentEnquiry, UserProfile


@admin.register(StudentEnquiry)
class StudentEnquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'mobile', 'email', 'career')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_editable = ('role',)
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')
