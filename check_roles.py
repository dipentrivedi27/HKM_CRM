from django.contrib.auth.models import User
from crmapp.models import UserProfile

print("\n=== UserProfile Status ===")
users = User.objects.all()
if not users:
    print("No users found in the database.")
else:
    for u in users:
        try:
            print(f"  {u.username:20s} | role = {u.profile.role:8s} | superuser = {u.is_superuser}")
        except UserProfile.DoesNotExist:
            print(f"  {u.username:20s} | *** NO PROFILE *** (run: python manage.py setup_roles)")

print(f"\n  Total users: {users.count()}")
print(f"  Total profiles: {UserProfile.objects.count()}")
