# Generated by Django 2.0.3 on 2018-10-16 18:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_auto_20181016_1400'),
    ]

    operations = [
        migrations.AlterField(
            model_name='past_orders',
            name='timestamp',
            field=models.DateTimeField(auto_now=True),
        ),
    ]