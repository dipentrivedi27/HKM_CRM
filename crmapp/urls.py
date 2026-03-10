from django.contrib import admin
from django.urls import path
from crmapp import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ── Authentication ──────────────────────────────────────
    path("", views.unified_login, name="login"),           # Unified login (Admin + User)
    path("user-login/", views.unified_login, name="user_login"),  # Same login page alias
    path("logout/", views.admin_logout, name="logout"),        # Logout
    path("user-logout/", views.user_logout, name="user_logout"),  # Logout alias

    # ── Core Pages ───────────────────────────────────────────
    path("dashboard/", views.dashboard, name='dashboard'),
    path('student/', views.studentform, name='studentform'),
    path('students/', views.students_list, name='students_list'),
    path('get_student/<int:id>/', views.get_student, name='get_student'),
    path("faculty/", views.faculty_page, name='faculty'),
    path("courses/", views.courses, name='courses'),
    path('fees/', views.fees_page, name='fees'),

    # ── Faculty CRUD ─────────────────────────────────────────
    path('faculty/add/', views.add_faculty, name='add_faculty'),
    path('faculty/list/', views.get_faculty, name='get_faculty'),
    path('faculty/delete/<int:faculty_id>/', views.delete_faculty, name='delete_faculty'),

    # ── Dashboard Counts / Charts ────────────────────────────
    path('dashboard/counts/', views.dashboard_counts, name='dashboard_counts'),
    path("chart/years/", views.get_years, name="chart_years"),
    path("chart/monthly/", views.get_monthly_fees, name="chart_monthly"),

    # ── Payment Management ───────────────────────────────────
    path('payment/edit/<int:payment_id>/', views.update_payment, name='update_payment'),
    path('payment/delete/<int:payment_id>/', views.delete_payment, name='delete_payment'),
    path('ajax/delete_payment/<int:payment_id>/', views.delete_payment_ajax, name='delete_payment_ajax'),
    path('student-payments/<int:student_id>/', views.student_payments, name='student_payments'),

    # ── Enquiry / Notifications ──────────────────────────────
    path('add-student/', views.add_student, name='add_student'),
    path("get-notifications/", views.get_notifications, name="get_notifications"),
    path("save-remark/<int:student_id>/", views.save_remark, name="save_remark"),
    path("delete-students/", views.delete_students, name="delete-students"),
    path("enquiries/count/", views.enquiry_count, name="enquiry_count"),
    path("enquiries/years/", views.enquiry_years, name="enquiry_years"),

    # ── Hold Management ──────────────────────────────────────
    path("hold/", views.hold_page, name="hold_page"),
    path('hold/remove/<int:student_id>/', views.remove_hold, name='remove_hold'),

    # ── Receipt Generation ───────────────────────────────────
    path('generate-receipt/<int:student_id>/', views.generate_receipt, name='generate_receipt'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
