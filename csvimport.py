import csv
import django
import os
from datetime import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm1.settings")
django.setup()

from crmapp.models import Student

csv_file = "students.csv"

with open(csv_file, encoding="utf-8") as file:
    reader = csv.DictReader(file)

    # Fix BOM in header (VERY IMPORTANT)
    reader.fieldnames = [name.replace("\ufeff", "") for name in reader.fieldnames]

    for row in reader:
        print("Inserting row:", row)

        # Convert date yyyy-mm-dd → python date
        row['added_on'] = datetime.strptime(row['added_on'], "%Y-%m-%d").date()

        Student.objects.create(
            name=row['name'],
            contact=row['contact'],
            course=row['course'],
            added_on=row['added_on'],
            remark=row['remark']
        )

print("CSV Imported Successfully!")
