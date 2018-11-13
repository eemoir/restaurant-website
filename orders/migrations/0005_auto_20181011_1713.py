# Generated by Django 2.0.3 on 2018-10-11 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_auto_20181004_1411'),
    ]

    operations = [
        migrations.AddField(
            model_name='all_sub_add_on',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='dinner_platter',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='pasta',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='regular_pizza',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='salad',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='sicilian_pizza',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='steak_sub_add_on',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='sub',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='topping',
            name='item_id',
            field=models.IntegerField(default=0),
        ),
    ]
