# Generated by Django 2.0.3 on 2018-10-16 14:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_auto_20181016_1016'),
    ]

    operations = [
        migrations.AddField(
            model_name='orders',
            name='timestamp',
            field=models.CharField(default='N/A', max_length=64),
        ),
    ]