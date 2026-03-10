from django.db import models

class StudentEnquiry(models.Model):
    date = models.DateField(null=True, blank=True)
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True)  # New field for unique student ID
    name = models.CharField(max_length=100)
    address = models.TextField()
    email = models.EmailField(blank=True, default="")
    mobile = models.CharField(max_length=10)
    alt_mobile = models.CharField(max_length=10)
    dob = models.DateField(null=True, blank=True)

    fees = models.IntegerField(null=True, blank=True)      # total fees
    # paid removed
    qualification = models.CharField(max_length=200, blank=True, default="")
    college = models.CharField(max_length=200, blank=True, default="")
    field = models.CharField(max_length=200, blank=True, default="")
    guardian = models.CharField(max_length=200, blank=True, default="")
    source = models.CharField(max_length=150, blank=True, null=True)

    career = models.CharField(max_length=300, blank=True, default="")
    # source removed
    # other_source removed

    # NEW: Photo Field Added
    photo = models.ImageField(
        upload_to='students/photos/', 
        null=True, 
        blank=True,
        help_text="Student's passport size photo"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    # Hold Status Fields (New)
    is_hold = models.BooleanField(default=False)
    hold_date = models.DateField(null=True, blank=True)
    hold_duration = models.CharField(max_length=100, null=True, blank=True)

    # hold fields removed
    # is_hold removed
    # hold_duration removed
    # hold_start removed

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Student Enquiry"
        verbose_name_plural = "Student Enquiries"
        ordering = ['-created_at']



class Faculty(models.Model):
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=50)
    department = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    experience = models.IntegerField(null=True, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.name

class StudentPayment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('UPI', 'UPI'),
        ('Check', 'Check'),
    ]
    student = models.ForeignKey(StudentEnquiry, on_delete=models.CASCADE)
    amount = models.IntegerField()
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='Cash')
    month = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.amount}"

# student enquiry data for institute
from django.utils import timezone
class Student(models.Model):
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=15)
    course = models.CharField(max_length=100)
    added_on = models.DateField(default=timezone.now) 
    remark = models.TextField(blank=True, null=True) 

    

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# USER PROFILE — Role-based access control
# ─────────────────────────────────────────────
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_ADMIN = 'admin'
    ROLE_USER  = 'user'
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_USER,  'User'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=ROLE_USER
    )

    def is_admin(self):
        return self.role == self.ROLE_ADMIN

    def __str__(self):
        return f"{self.user.username} ({self.role})"
