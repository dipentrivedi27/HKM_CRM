from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from crmapp.models import StudentEnquiry, StudentPayment, Faculty, Student, UserProfile


class Command(BaseCommand):
    help = 'Setup default groups, permissions, and UserProfile roles for all users'

    def handle(self, *args, **kwargs):
        # ──────────────────────────────────────────────
        # 1. Create Auth Groups
        # ──────────────────────────────────────────────
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        staff_group, _ = Group.objects.get_or_create(name='Staff')
        self.stdout.write(self.style.SUCCESS('Groups "Admin" and "Staff" ensured.'))

        # ──────────────────────────────────────────────
        # 2. Assign Permissions to Groups
        # ──────────────────────────────────────────────
        ct_student = ContentType.objects.get_for_model(StudentEnquiry)
        ct_payment = ContentType.objects.get_for_model(StudentPayment)
        ct_faculty = ContentType.objects.get_for_model(Faculty)

        # Admin: full access to all CRM models
        all_perms = Permission.objects.filter(
            content_type__in=[ct_student, ct_payment, ct_faculty]
        )
        admin_group.permissions.set(all_perms)

        # Staff: view/add/change students + view faculty. NO delete, NO payments.
        staff_perms = [
            Permission.objects.get(codename='view_studentenquiry', content_type=ct_student),
            Permission.objects.get(codename='add_studentenquiry',  content_type=ct_student),
            Permission.objects.get(codename='change_studentenquiry', content_type=ct_student),
            Permission.objects.get(codename='view_faculty',        content_type=ct_faculty),
        ]
        staff_group.permissions.set(staff_perms)
        self.stdout.write(self.style.SUCCESS('Permissions assigned to groups.'))

        # ──────────────────────────────────────────────
        # 3. Create/Update UserProfile for every User
        #    - Superusers  → role = 'admin'
        #    - Everyone else → role = 'user'
        # ──────────────────────────────────────────────
        for user in User.objects.all():
            role = UserProfile.ROLE_ADMIN if user.is_superuser else UserProfile.ROLE_USER
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': role}
            )
            if not created and profile.role != role:
                # Only auto-update if it hasn't been manually set already
                pass  # Do NOT overwrite manually assigned roles
            action = 'Created' if created else 'Already exists'
            self.stdout.write(
                f"  {action}: UserProfile for '{user.username}' → role='{profile.role}'"
            )

        self.stdout.write(self.style.SUCCESS('\n✅ Setup complete! Run this command again anytime to sync new users.'))
        self.stdout.write(
            self.style.WARNING(
                '\nTo change a specific user\'s role, use Django Admin or the shell:\n'
                '  python manage.py shell\n'
                '  >>> from crmapp.models import UserProfile\n'
                '  >>> from django.contrib.auth.models import User\n'
                '  >>> p = UserProfile.objects.get(user__username="someuser")\n'
                '  >>> p.role = "admin"   # or "user"\n'
                '  >>> p.save()\n'
            )
        )
