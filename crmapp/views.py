from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Q, Count
from django.db.models.functions import TruncMonth, ExtractMonth, Coalesce
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import datetime
from functools import wraps
import calendar
import json
import os
from django.conf import settings

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import Table, TableStyle
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from .models import StudentEnquiry, Faculty, StudentPayment, Student, UserProfile

# ─────────────────────────────────────────────
# ROLE-BASED DECORATORS
# ─────────────────────────────────────────────

def admin_required(view_func):
    """
    Allows ONLY users whose UserProfile.role == 'admin'.
    Redirects everyone else to the admin login page.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Please login to continue.")
            return redirect('login')
        try:
            if request.user.profile.role != UserProfile.ROLE_ADMIN:
                messages.error(request, "⛔ Admin access required.")
                return redirect('login')
        except UserProfile.DoesNotExist:
            messages.error(request, "⛔ No role assigned to your account. Contact administrator.")
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper


def user_or_admin_required(view_func):
    """
    Allows BOTH admin and user roles.
    Redirects unauthenticated visitors to the login page.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Please login to continue.")
            return redirect('login')
        try:
            role = request.user.profile.role
            if role not in (UserProfile.ROLE_ADMIN, UserProfile.ROLE_USER):
                messages.error(request, "⛔ Access denied.")
                return redirect('login')
        except UserProfile.DoesNotExist:
            messages.error(request, "⛔ No role assigned to your account. Contact administrator.")
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper


# def dashboard(request):
#     return render(request, "index.html")

# def students(request):
#     return render(request, "studentform.html")
@user_or_admin_required
def students_list(request):

    # -----------------------
    # 1️⃣ POST REQUEST (form actions)
    # -----------------------
    if request.method == 'POST':
        action = request.POST.get('action')
        student_id = request.POST.get('student_id')

        if not student_id:
            messages.error(request, "Invalid student.")
            return redirect('students_list')

        student = get_object_or_404(StudentEnquiry, id=student_id)

        # DELETE
        if action == 'delete':
            # 🔒 PERMISSION CHECK — only admin can delete
            try:
                if request.user.profile.role != UserProfile.ROLE_ADMIN:
                    messages.error(request, "⛔ Permission Denied: Only Admin can delete students.")
                    return redirect('students_list')
            except UserProfile.DoesNotExist:
                messages.error(request, "⛔ Permission Denied.")
                return redirect('students_list')

            student.delete()
            messages.success(request, "✅ Student deleted successfully.")
            return redirect('students_list')

        # UPDATE
        elif action == 'update':
            student.date = request.POST.get('date')
            student.student_id = request.POST.get('student_uid')
            student.name = request.POST.get('name')
            student.address = request.POST.get('address')
            student.email = request.POST.get('email')
            student.mobile = request.POST.get('mobile')
            student.alt_mobile = request.POST.get('alt_mobile')
            student.dob = request.POST.get('dob')
            student.qualification = request.POST.get('qualification')
            student.college = request.POST.get('college')
            student.field = request.POST.get('field')
            student.guardian = request.POST.get('guardian')
            student.career = request.POST.get('career')
            student.fees = request.POST.get('fees')
            student.source = request.POST.get('source')

            if request.FILES.get('photo'):
                student.photo = request.FILES.get('photo')

            student.save()
            messages.success(request, "✅ Student updated successfully.")
            return redirect('students_list')

        # PAYMENT
        elif action == 'payment':
            amount = request.POST.get('amount')
            payment_date = request.POST.get('payment_date')
            payment_method = request.POST.get('payment_method')

            if not amount or not payment_date:
                messages.error(request, "Payment details missing")
                return redirect('students_list')

            StudentPayment.objects.create(
                student=student,
                amount=int(amount),
                payment_date=payment_date,
                payment_method=payment_method,
                month=payment_date[:7]
            )

            messages.success(request, f"💰 Payment of ₹{amount} added for {student.name}")
            return redirect('students_list')

        # HOLD
        elif action == 'hold':
            duration = request.POST.get('hold_duration')
            
            student.is_hold = True
            student.hold_duration = duration
            student.hold_date = datetime.now()
            student.save()

            messages.success(request, f"⏳ {student.name} added to Hold!")
            return redirect('hold_page')

    # -----------------------
    # 2️⃣ GET REQUEST (fetch students)
    # -----------------------
    
    # Filter active students (not on hold)
    students = StudentEnquiry.objects.filter(is_hold=False).order_by('id')

    is_admin = False
    try:
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
    except Exception:
        pass

    return render(request, 'students_list.html', {
        'students': students,
        'is_admin': is_admin
    })










# def faculty(request):
#     return render(request, "faculty.html")


@user_or_admin_required
def studentform(request):
    enquiry_data = {}
    enquiry_id = request.GET.get('enquiry_id') or request.POST.get('enquiry_id')
    
    if request.method == "POST":

        career_list = request.POST.getlist('career')
        career_string = ", ".join(career_list)

        StudentEnquiry.objects.create(
            date=request.POST.get('date'),
            student_id=request.POST.get('student_id'),  # New field for unique student ID
            name=request.POST.get('name'),
            address=request.POST.get('address'),
            email=request.POST.get('email'),
            mobile=request.POST.get('mobile'),
            alt_mobile=request.POST.get('alt_mobile'),  # ✅ ADD THIS
            dob=request.POST.get('dob'),
            photo=request.FILES.get('photo'),
            qualification=request.POST.get('qualification'),
            college=request.POST.get('college'),
            field=request.POST.get('field'),
            guardian=request.POST.get('guardian'),
            career=career_string,
            fees=request.POST.get('fees'),
            source=request.POST.get('source'),
        )
        
        if enquiry_id:
            Student.objects.filter(id=enquiry_id).delete()
            
        messages.success(request, "✅ Enquiry form submitted successfully!")
        return redirect('studentform')

    if enquiry_id:
        try:
            enquiry = Student.objects.get(id=enquiry_id)
            enquiry_data = {
                'id': enquiry.id,
                'name': enquiry.name,
                'mobile': enquiry.contact,
                'course': enquiry.course
            }
        except Student.DoesNotExist:
            pass

    is_admin = False
    try:
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
    except Exception:
        pass

    return render(request, 'studentform.html', {'is_admin': is_admin, 'enquiry': enquiry_data})



from django.http import JsonResponse
def get_student(request, id):
    s = get_object_or_404(StudentEnquiry, id=id)
    return JsonResponse({
        'name': s.name,
        'mobile': s.mobile,
        'email': s.email,
        'career': s.career,
        'course': getattr(s, 'course', ''),  # if field exists
        'source': s.source,
        'other_source': getattr(s, 'other_source', ''),
        'city': getattr(s, 'city', ''),
        'state': getattr(s, 'state', ''),
        'qualification': s.qualification,
        'message': getattr(s, 'message', '')
    })


# ─────────────────────────────────────────────
# LOGIN / LOGOUT VIEWS  (UNIFIED — single page for both roles)
# ─────────────────────────────────────────────

def unified_login(request):
    """
    ONE login page for BOTH Admin and User.
    - Authenticates credentials with Django's built-in authenticate().
    - Reads the UserProfile.role to know who is logging in.
    - Admin  → full access to everything.
    - User   → limited access (no delete, no payment edits).
    - Session is FLUSHED before login so old permission caches are wiped.
    """
    # Already logged in → go straight to dashboard
    if request.user.is_authenticated:
        try:
            _ = request.user.profile  # has a role → safe to proceed
            return redirect('dashboard')
        except UserProfile.DoesNotExist:
            pass  # no profile → fall through and show login

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Check UserProfile exists
            try:
                profile = user.profile
            except UserProfile.DoesNotExist:
                messages.error(
                    request,
                    "⛔ No role assigned to this account. "
                    "Please contact the administrator."
                )
                return render(request, "login.html")

            # ✅ KEY FIX: flush the old session → wipes any cached permissions
            #    from a previously logged-in user in the same browser.
            request.session.flush()
            login(request, user)

            # Both admin and user land on dashboard; the dashboard and all
            # views enforce role permissions via decorators.
            return redirect("dashboard")

        else:
            messages.error(request, "❌ Invalid Username or Password")

    return render(request, "login.html")


def admin_logout(request):
    """Logs out the current user and redirects to the login page."""
    logout(request)
    return redirect("login")


# Keep user_logout as an alias so any existing links still work
def user_logout(request):
    logout(request)
    return redirect("login")



# ---------- DASHBOARD ----------
@user_or_admin_required
def dashboard(request):

    # TOTAL EXPECTED (SUM of all student fees)
    total_expected = StudentEnquiry.objects.aggregate(sum=Sum('fees'))['sum'] or 0

    # TOTAL COLLECTED (SUM of all payments)
    total_collected = StudentPayment.objects.aggregate(sum=Sum('amount'))['sum'] or 0

    # HOLD COUNT from DB
    hold_count = StudentEnquiry.objects.filter(is_hold=True).count()

    # Role flag so templates can show/hide admin-only UI
    is_admin = False
    try:
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
    except UserProfile.DoesNotExist:
        pass

    return render(request, "index.html", {
        "total_expected": total_expected,
        "total_collected": total_collected,
        "hold_students": hold_count,
        "is_admin": is_admin,
    })




# ---------- STUDENTS LIST ----------
# @login_required(login_url="login")
# def students_list(request):
#     students = StudentEnquiry.objects.all()
#     return render(request, "students_list.html", {"students": students})

# ---------- COURSES ----------
def courses(request):
    is_admin = False
    try:
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
    except Exception:
        pass
    return render(request, "courses.html", {'is_admin': is_admin})

# ---------- FEES ----------
@user_or_admin_required
def fees_page(request):
    # ==========================
    # CURRENT YEAR
    # ==========================
    current_year = timezone.now().year

    # ==========================
    # SELECTED YEAR (IMPORTANT: int)
    # ==========================
    selected_year = int(request.GET.get("year", current_year))

    # ==========================
    # YEAR DROPDOWN OPTIONS
    # ==========================
    years = StudentEnquiry.objects.dates(
        'created_at', 'year', order='DESC'
    )
    years = [y.year for y in years]

    # ==========================
    # FILTER STUDENTS BY YEAR
    # ==========================
    students = StudentEnquiry.objects.filter(
        created_at__year=selected_year,
        is_hold=False
    ).order_by("id")

    # ==========================
    # FEES CALCULATION
    # ==========================
    total_collected = 0
    total_total = 0

    for s in students:
        paid = (
            StudentPayment.objects
            .filter(student=s)
            .aggregate(total=Sum('amount'))['total']
            or 0
        )

        pending = (s.fees or 0) - paid

        # attach calculated values to object
        s.paid_fees = paid
        s.pending_fees = pending
        s.total_fees = paid + pending   # ✅ MAIN FIX

        total_collected += paid
        total_total += s.total_fees

    # ==========================
    # PERMISSION CHECK
    # ==========================
    can_view_details = request.user.has_perm(
        'crmapp.view_studentpayment'
    )

    is_admin = False
    try:
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
    except Exception:
        pass

    # ==========================
    # RENDER
    # ==========================
    return render(request, "fees.html", {
        "students": students,
        "years": years,
        "selected_year": selected_year,
        "total_collected": total_collected,
        "total_total": total_total,
        "can_view_details": can_view_details,
        "is_admin": is_admin,
    })  


# ---------- LOGOUT ----------
def admin_logout(request):
    """
    Logs out the current user (admin) and redirects to admin login.
    logout() destroys the session completely — this is correct Django behaviour.
    For true simultaneous admin+user sessions, use two different browsers.
    """
    logout(request)
    return redirect("login")


def user_logout(request):
    """
    Logs out the current user (user role) and redirects to user login page.
    """
    logout(request)
    return redirect("user_login")


@user_or_admin_required
def faculty_page(request):
    is_admin = False
    try:
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
    except Exception:
        pass
    return render(request, 'faculty.html', {'is_admin': is_admin})

@admin_required
@csrf_exempt
def add_faculty(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            Faculty.objects.create(
                name=data['name'],
                designation=data['designation'],
                department=data['department'],
                email=data['email'],
                phone=data['phone'],
                experience=data.get('experience') or 0,
                bio=data.get('bio', '')
            )
            return JsonResponse({"status": "success", "message": "Faculty added successfully"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=405)

def get_faculty(request):
    faculties = Faculty.objects.all().order_by('-id')
    data = []

    for f in faculties:
        data.append({
            "id": f.id,
            "name": f.name,
            "designation": f.designation,
            "department": f.department,
            "email": f.email,
            "phone": f.phone,
            "experience": f.experience,
            "bio": f.bio,
        })

    return JsonResponse(data, safe=False)

@admin_required
@csrf_exempt
def delete_faculty(request, faculty_id):
    if request.method == "POST":
        try:
            faculty = get_object_or_404(Faculty, id=faculty_id)
            faculty.delete()
            return JsonResponse({"status": "success", "message": "Faculty deleted successfully"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

# Student and Faculty counts for dashboard
def dashboard_counts(request):
    data = {
        "total_students": StudentEnquiry.objects.count(),
        "total_faculty": Faculty.objects.count(),
    }
    return JsonResponse(data)

@admin_required
def update_payment(request, payment_id):
    payment = get_object_or_404(StudentPayment, id=payment_id)

    if request.method == "POST":
        payment.amount = int(request.POST.get("amount"))
        payment.payment_date = request.POST.get("payment_date")
        payment.save()

        messages.success(request, "✅ Payment updated")
        return redirect('fees_page')

    return render(request, 'edit_payment.html', {'payment': payment})

@admin_required
def delete_payment(request, payment_id):
    payment = get_object_or_404(StudentPayment, id=payment_id)
    payment.delete()

    messages.success(request, "❌ Payment deleted")
    return redirect('fees_page')

def student_payments(request, student_id):
    payments = StudentPayment.objects.filter(student_id=student_id).order_by('-payment_date')

    data = []
    for p in payments:
        data.append({
    'id': p.id,
    'date': p.payment_date.strftime('%d-%m-%Y'),
    'amount': p.amount
})
    return JsonResponse(data, safe=False)


# Fee chart data for dashboard
def get_monthly_fees(request):
    year_param = request.GET.get("year")
    if not year_param:
        year_param = datetime.now().year
    
    year = int(year_param)

    months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    # Bar Chart: Monthly collections made DURING this year (Cash Inflow)
    totals = []
    for m in range(1, 13):
        total = StudentPayment.objects.filter(
            payment_date__year=year,
            payment_date__month=m
        ).aggregate(sum=Sum("amount"))["sum"] or 0
        totals.append(total)

    # Batch Analytics (Students admitted IN this year)
    # This aligns exactly with how fees.html calculates totals for a selected year using the 'date' field
    batch_students = StudentEnquiry.objects.filter(date__year=year)
    
    total_expected = batch_students.aggregate(sum=Sum('fees'))['sum'] or 0
    # Total collected from these batch students (all-time)
    total_collected = StudentPayment.objects.filter(student__in=batch_students).aggregate(sum=Sum('amount'))['sum'] or 0
    total_pending = total_expected - total_collected

    # Course-wise Analytics (For students admitted in this year)
    from django.db.models import Count
    
    # 🌟 NEW: Master Courses List from the Student Form (Career Interests)
    MASTER_COURSES = [
        "Graphics Design", "Graphics Design/ Video Editing", "UI/UX Design",
        "UI/UX Design/ Video Editing", "Web Design", "Digital Marketing",
        "PGA", "PGA Advance", "VFX", "3D Architectural",
        "Video Editing", "Game Design", "C/C++/CCC"
    ]
    
    # Get actual counts for this year
    course_counts_qs = batch_students.values('career').annotate(count=Count('id'))
    counts_map = {item['career']: item['count'] for item in course_counts_qs}
    
    # 🌟 LOGIC FIX: User says 1 student should look "low" not "100%".
    # User requested a fixed target goal of 50 students per category.
    TARGET_GOAL = 50
    
    courses = []
    course_percentages = []
    course_totals = []
    
    for course_name in MASTER_COURSES:
        count = counts_map.get(course_name, 0)
        # Percentage relative to the fixed target goal of 50. Cap at 100%.
        percentage = round(min((count / TARGET_GOAL * 100), 100), 1)
        
        courses.append(course_name)
        course_percentages.append(percentage)
        course_totals.append(count)

    # 🌟 NEW: Lead Source Analytics (How Did You Hear About Us?)
    MASTER_SOURCES = [
        "Online Search", "Social Media", "Referral", 
        "Advertisement", "Other"
    ]
    
    source_counts_qs = batch_students.values('source').annotate(count=Count('id'))
    sources_map = {item['source']: item['count'] for item in source_counts_qs}
    
    sources = []
    source_percentages = []
    source_totals = []
    
    for src_name in MASTER_SOURCES:
        count = sources_map.get(src_name, 0)
        # Percentage relative to the fixed target goal of 50. Cap at 100%.
        percentage = round(min((count / TARGET_GOAL * 100), 100), 1)
        
        sources.append(src_name)
        source_percentages.append(percentage)
        source_totals.append(count)

    return JsonResponse({
        "labels": months, 
        "totals": totals,
        "yearly": {
            "total": total_expected,
            "collected": total_collected,
            "pending": total_pending,
            "percentage": round((total_collected / total_expected * 100), 2) if total_expected > 0 else 0
        },
        "courses": {
            "labels": courses,
            "percentages": course_percentages,
            "counts": course_totals
        },
        "sources": {
            "labels": sources,
            "percentages": source_percentages,
            "counts": source_totals
        }
    })


def get_years(request):
    # Admission Date (date field) is the primary source of truth for backdated entries
    years_date = StudentEnquiry.objects.dates('date', 'year', order='DESC')
    years_created = StudentEnquiry.objects.dates('created_at', 'year', order='DESC')
    
    all_years = set()
    for y in years_date: all_years.add(y.year)
    for y in years_created: all_years.add(y.year)
    
    if not all_years:
        all_years.add(datetime.now().year)

    year_list = sorted(list(all_years), reverse=True)
    return JsonResponse({"years": year_list})

# Delete payment via AJAX
# ---------------- Normal Delete (Redirect) ----------------
@admin_required
def delete_payment_redirect(request, payment_id):
    """
    Deletes payment normally (via POST or GET), then redirects to fees page
    """
    payment = get_object_or_404(StudentPayment, id=payment_id)
    payment.delete()
    messages.success(request, "❌ Payment deleted successfully!")
    return redirect('fees')

# ---------------- AJAX Delete ----------------
@admin_required
def delete_payment_ajax(request, payment_id):
    """
    Deletes payment via AJAX POST request, returns JSON response
    """
    if request.method == "POST":
        try:
            payment = StudentPayment.objects.get(id=payment_id)
            payment.delete()
            return JsonResponse({"status": "success", "message": "Payment deleted successfully!"}, status=200)
        except StudentPayment.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Payment not found"}, status=404)

    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)


from .models import Student

@csrf_exempt
def add_student(request):
    if request.method == "POST":
        data = json.loads(request.body)
        student = Student.objects.create(
            name=data["name"],
            contact=data["contact"],
            course=data["course"],
             added_on=timezone.localdate() # local time store
        )
        return JsonResponse({
            "id": student.id,
            "name": student.name,
            "contact": student.contact,
            "course": student.course,
             "added_on": student.added_on.strftime('%d %b %Y')  # already local time
        })
    


@csrf_exempt
def delete_students(request):
    if request.method == "POST":
        data = json.loads(request.body)
        ids = data.get("ids", [])

        Student.objects.filter(id__in=ids).delete()
        return JsonResponse({"status": "deleted"})



def get_notifications(request):
    data = []
    for s in Student.objects.all().order_by("-id"):
        data.append({
            "id": s.id,
            "name": s.name,
            "contact": s.contact,
            "course": s.course,
            "remark": s.remark or "",   # <<< ADD THIS LINE
            "added_on": s.added_on.strftime('%d %b %Y')
        })
    return JsonResponse({"students": data})


# ----- Save Remark -----
@csrf_exempt
def save_remark(request, student_id):
    if request.method == "POST":
        data = json.loads(request.body)
        remark = data.get('remark', '').strip()
        try:
            student = Student.objects.get(id=student_id)
            student.remark = remark  # Save remark even if blank
            student.save()
            return JsonResponse({"status": "success"})
        except Student.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Student not found"})
    return JsonResponse({"status": "error", "message": "Invalid method"})


@user_or_admin_required
def hold_page(request):
    # Fetch held students from DB
    hold_students_qs = StudentEnquiry.objects.filter(is_hold=True).order_by('-hold_date')

    updated_list = []

    for student in hold_students_qs:
        paid = StudentPayment.objects.filter(student=student).aggregate(total=Sum('amount'))['total'] or 0
        pending = (student.fees or 0) - paid

        # Create dictionary for template (matching previous structure)
        updated_list.append({
            'id': student.id,
            'name': student.name,
            'fees': student.fees,
            'duration': student.hold_duration,
            'date': student.hold_date,  # Model field
            'paid_fees': paid,
            'pending_fees': pending
        })

    is_admin = False
    try:
        is_admin = request.user.profile.role == UserProfile.ROLE_ADMIN
    except Exception:
        pass

    return render(request, 'hold.html', {
        'hold_list': updated_list,
        'is_admin': is_admin
    })

@user_or_admin_required
def remove_hold(request, student_id):
    student = get_object_or_404(StudentEnquiry, id=student_id)
    student.is_hold = False
    student.hold_duration = None
    student.hold_date = None
    student.save()

    messages.success(request, "✅ Student removed from Hold")
    return redirect('hold_page')

@user_or_admin_required
def generate_student_receipt(request, student_id):
    if not REPORTLAB_AVAILABLE:
        messages.error(request, "Receipt generation is temporarily unavailable. Please contact the administrator.")
        return redirect('students_list')

    student = get_object_or_404(StudentEnquiry, id=student_id)
    payments = StudentPayment.objects.filter(student=student).order_by('payment_date')
    
    total_fees = student.fees or 0
    total_paid = payments.aggregate(Sum('amount'))['amount__sum'] or 0
    remaining = total_fees - total_paid
    latest_payment = payments.last()
    
    # Create the HttpResponse object with the appropriate PDF headers.
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="Receipt_{student.name}.pdf"'

    # Create the PDF object, using the response object as its "file."
    p = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    # 1. Page Border
    p.setStrokeColor(colors.black)
    p.setLineWidth(2)
    p.rect(20, 20, width - 40, height - 40)

    # 2. Institute Logo
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'hkmi.jpeg')
    if os.path.exists(logo_path):
        p.drawImage(logo_path, width/2 - 50, height - 120, width=100, height=80, mask='auto')

    # 3. Institute Name
    p.setFont("Helvetica-Bold", 22)
    p.drawCentredString(width/2, height - 150, "Harikrushna Multimedia Institute")
    
    p.setFont("Helvetica", 10)
    p.drawCentredString(width/2, height - 165, "Quality Education in Graphics, Web, Animation & VFX")

    # 4. Horizontal Line
    p.setLineWidth(1)
    p.line(50, height - 180, width - 50, height - 180)

    # 5. Student Details Section
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, height - 210, "STUDENT DETAILS")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 235, f"Student Name: {student.name}")
    p.drawString(50, height - 255, f"Course Name: {student.career or 'N/A'}")
    p.drawString(50, height - 275, f"Total Course Fees: Rs. {total_fees}")
    p.drawString(width - 200, height - 235, f"Receipt Date: {datetime.now().strftime('%d-%m-%Y')}")
    p.drawString(width - 200, height - 255, f"Student UID: UID-{student.id}")

    # 6. Payment Details Section (Table)
    p.line(50, height - 295, width - 50, height - 295)
    p.setFont("Helvetica-Bold", 14)
    p.drawCentredString(width/2, height - 320, "PAYMENT DETAILS")

    data = [["Date", "Description", "Amount (Rs.)"]]
    for i, pay in enumerate(payments, 1):
        data.append([pay.payment_date.strftime('%d-%m-%Y'), f"Installment {i} - {pay.payment_method}", f"{pay.amount}"])

    table_width = 5.5 * inch
    table = Table(data, colWidths=[1.5*inch, 2.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    # Calculate table height and position
    table_height = (len(payments) + 1) * 25
    table.wrapOn(p, width, height)
    # Center the table: (Page Width - Table Width) / 2
    table.drawOn(p, (width - table_width) / 2, height - 350 - table_height)

    # 7. Summary Section
    summary_y = height - 380 - table_height
    p.line(50, summary_y, width - 50, summary_y)
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, summary_y - 30, f"Total Fees: Rs. {total_fees}")
    p.drawString(50, summary_y - 50, f"Total Paid: Rs. {total_paid}")
    
    p.setFillColor(colors.darkgreen)
    p.drawString(width - 250, summary_y - 30, f"Current Paid Amount: Rs. {latest_payment.amount if latest_payment else 0}")
    
    p.setFillColor(colors.red)
    p.drawString(width - 250, summary_y - 50, f"Remaining Balance: Rs. {remaining}")

    # Reset color
    p.setFillColor(colors.black)
    
    # 8. Footer/Signature
    p.setFont("Helvetica-Oblique", 10)
    p.drawCentredString(width/2, 100, "This is a computer-generated receipt and does not require a physical signature.")
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(width - 150, 60, "Authorized Sign")
    p.line(width - 160, 75, width - 40, 75)

    # Finalize the PDF
    p.showPage()
    p.save()

    return response



@user_or_admin_required
def monthly_chart(request):
    year = int(request.GET.get("year", datetime.now().year))

    # Monthly collected fees (bar chart mate)
    monthly = (
        StudentPayment.objects.filter(payment_date__year=year)
        .annotate(month=ExtractMonth("payment_date"))
        .values("month")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )

    labels = []
    totals = []

    for m in range(1, 13):
        labels.append(calendar.month_abbr[m])
        total = next((x["total"] for x in monthly if x["month"] == m), 0)
        totals.append(total)

    # YEARLY totals (donut chart mate)
    expected_total = (
        StudentEnquiry.objects.filter(date__year=year)
        .aggregate(sum=Sum("fees"))["sum"] or 0
    )

    collected_total = (
        StudentPayment.objects.filter(payment_date__year=year)
        .aggregate(sum=Sum("amount"))["sum"] or 0
    )

    return JsonResponse({
        "labels": labels,
        "totals": totals,
        # Change karo: yearly object banavo → frontend ma simple access
        "yearly": {
            "expected": expected_total,
            "collected": collected_total,
        }
    })

def enquiry_count(request):
    year = request.GET.get("year")
    month = request.GET.get("month")

    qs = Student.objects.all()

    if year:
        qs = qs.filter(added_on__year=year)
    if month:
        qs = qs.filter(added_on__month=month)

    return JsonResponse({
        "count": qs.count(),
        "required": 100   # target number (change if needed)
    })


def enquiry_years(request):
    years = (
        Student.objects
        .dates('added_on', 'year')
        .values_list('added_on__year', flat=True)
        .distinct()
    )

    return JsonResponse({
        "years": list(years)
    })

@user_or_admin_required
def generate_receipt(request, student_id):
    if not REPORTLAB_AVAILABLE:
        return HttpResponse("Receipt generation is temporarily unavailable. Please contact the administrator.")

    student = get_object_or_404(StudentEnquiry, id=student_id)
    payments = StudentPayment.objects.filter(student=student).order_by('payment_date')
    
    total_paid = payments.aggregate(Sum('amount'))['amount__sum'] or 0
    total_fees = student.fees or 0
    remaining_balance = total_fees - total_paid

    # Latest payment
    latest_payment = payments.last()
    current_paid = latest_payment.amount if latest_payment else 0
    latest_date = latest_payment.payment_date if latest_payment else "N/A"

    # Create PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="Receipt_{student.name}_{student_id}.pdf"'

    c = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    # 1. Professional Double Border
    c.setStrokeColor(colors.HexColor("#2c3e50")) # Deep Slate Blue
    c.setLineWidth(2)
    c.rect(25, 25, width - 50, height - 50)
    c.setLineWidth(0.5)
    c.rect(30, 30, width - 60, height - 60)

    # 2. Header Section - Premium Layout
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'hkmi.jpeg')
    if os.path.exists(logo_path):
        # Position logo on the far left with padding
        c.drawImage(logo_path, 50, height - 115, width=90, height=70)
    
    # Institute Branding
    c.setFillColor(colors.HexColor("#2c3e50"))
    c.setFont("Helvetica-Bold", 20) # Slightly smaller to avoid border overlap
    c.drawCentredString(width / 2 + 35, height - 75, "HARIKRUSHNA MULTIMEDIA INSTITUTE")
    
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2 + 35, height - 92, "M-36/37, 2nd Floor, Raj Corner Shopping Centre, TP 10 Main Rd,")
    c.drawCentredString(width / 2 + 35, height - 106, "Near L.P. Savani, Pal Surat, Gujarat - 395009")

    # Formal Banner
    c.setFillColor(colors.HexColor("#f4f6f7"))
    c.rect(50, height - 155, width - 100, 30, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#2c3e50"))
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2, height - 145, "FEES RECEIPT")

    top_y = height - 175

    # 3. Student Information - Full Page Width Box
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)
    c.rect(50, top_y - 85, width - 100, 85, stroke=1)
    
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(colors.black)
    c.drawString(65, top_y - 25, f"Student Name  :  {student.name.upper()}")
    c.drawString(65, top_y - 45, f"Course Name   :  {student.career or 'N/A'}")
    c.drawString(65, top_y - 65, f"Total Fees    :  Rs. {total_fees}/-")
    
    c.drawString(width - 200, top_y - 25, f"Receipt No :  HKMI-R{student.id:03d}")
    c.drawString(width - 200, top_y - 45, f"Stu id     :  UID-{student.id:03d}")
    c.drawString(width - 200, top_y - 65, f"Date       :  {datetime.now().strftime('%d-%m-%Y')}")

    # 4. Payment BREAKDOWN - Full Page Width Table
    table_top = top_y - 110
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, table_top, "PAYMENT BREAKDOWN")

    data = [['DATE', 'PARTICULARS', 'AMOUNT (INR)']]
    for i, p in enumerate(payments, 1):
        data.append([p.payment_date.strftime('%d-%m-%Y'), f"Installment {i} - {p.payment_method}", f"Rs. {p.amount}/-"])
    
    if len(data) == 1:
        data.append(['-', 'No Payments Found', 'Rs. 0/-'])

    # Table styling for full-page width (Margins 50 each side = 495 width)
    table = Table(data, colWidths=[120, 275, 100])
    ts = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ])
    
    # Alternate row colors
    for i in range(1, len(data)):
        if i % 2 == 0:
            ts.add('BACKGROUND', (0, i), (-1, i), colors.HexColor("#f2f3f4"))

    table.setStyle(ts)
    
    t_width, t_height = table.wrap(495, 600)
    table_draw_y = table_top - 15 - t_height
    table.drawOn(c, 50, table_draw_y)

    # 5. Financial Summary - Full Width Formatting
    summary_y = table_draw_y - 30
    c.setFillColor(colors.HexColor("#f8f9f9"))
    c.rect(50, summary_y - 95, width - 100, 95, fill=1, stroke=1)
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(70, summary_y - 25, f"Latest Paid Date : {latest_date}")
    c.drawString(70, summary_y - 45, f"Current Paid     : Rs. {current_paid}/-")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(width - 250, summary_y - 25, f"Total Fees     : Rs. {total_fees}")
    c.drawString(width - 250, summary_y - 45, f"Total Received : Rs. {total_paid}")
    
    c.setStrokeColor(colors.grey)
    c.line(width - 250, summary_y - 52, width - 70, summary_y - 52)
    
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.HexColor("#c0392b")) # Red
    c.drawString(width - 250, summary_y - 75, f"Balance Due    : Rs. {remaining_balance}/-")

    # 6. Signatures - Premium Spacing
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 11)
    sig_y = summary_y - 150
    
    # Student Signature
    c.line(65, sig_y + 15, 205, sig_y + 15)
    c.drawCentredString(135, sig_y, "STUDENT SIGNATURE")
    
    # Authorized Signatory
    c.line(width - 205, sig_y + 15, width - 65, sig_y + 15)
    c.drawCentredString(width - 135, sig_y, "AUTHORIZED SIGNATORY")

    # Branding Footer
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(width / 2, 60, "THANK YOU FOR YOUR ASSOCIATION")
    c.line(width / 2 - 80, 56, width / 2 + 80, 56)

    c.showPage()
    c.save()
    return response

# from django.contrib.auth.decorators import permission_required

# @permission_required('crmapp.view_fees', raise_exception=True)
# def fees_page(request):
#     fees = StudentPayment.objects.all()   # 👈 DATA FETCH
#     return render(request, "fees.html", {
#         "fees": fees
#     })


