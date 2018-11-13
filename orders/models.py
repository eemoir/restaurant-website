from django.db import models
from jsonfield import JSONField
from django.contrib.postgres.fields import ArrayField

class Regular_pizza(models.Model):
    name = models.CharField(max_length=32)
    small = models.DecimalField(max_digits=5, decimal_places=2)
    large = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Regular {self.name} Pizza: small ${self.small}, large ${self.large}"

class Sicilian_pizza(models.Model):
    name = models.CharField(max_length=32)
    small = models.DecimalField(max_digits=5, decimal_places=2)
    large = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Sicilian {self.name} Pizza: small ${self.small}, large ${self.large}"

class Topping(models.Model):
    name = models.CharField(max_length=32)

    def __str__(self):
        return f"{self.name}"

    def as_dict(self):
        return {
            "topping": self.name
        }

class Sub(models.Model):
    name = models.CharField(max_length=32)
    small = models.DecimalField(null=True, blank=True, max_digits=5, decimal_places=2)
    large = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name}: small ${self.small}, large ${self.large}"

class All_Sub_Add_On(models.Model):
    name = models.CharField(max_length=32)
    price = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name}: ${self.price}"

class Steak_Sub_Add_On(models.Model):
    name = models.CharField(max_length=32)
    price = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name}: ${self.price}"

class Pasta(models.Model):
    name = models.CharField(max_length=32)
    price = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name}, ${self.price}"

class Salad(models.Model):
    name = models.CharField(max_length=32)
    price = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name}, ${self.price}"

class Dinner_Platter(models.Model):
    name = models.CharField(max_length=32)
    small = models.DecimalField(max_digits=5, decimal_places=2)
    large = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name} Dinner Platter: small ${self.small}, large ${self.large}"

class Past_Orders(models.Model):
    user = models.CharField(max_length=20)
    order = ArrayField(base_field=JSONField())
    total = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"user: {self.user}, items: {self.order}, time: {self.timestamp}"