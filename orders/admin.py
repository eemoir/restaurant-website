from django.contrib import admin

from .models import Regular_pizza, Sicilian_pizza, Topping, Sub, All_Sub_Add_On, Steak_Sub_Add_On, Pasta, Salad, Dinner_Platter, Past_Orders

admin.site.register(Regular_pizza)
admin.site.register(Sicilian_pizza)
admin.site.register(Topping)
admin.site.register(Sub)
admin.site.register(All_Sub_Add_On)
admin.site.register(Steak_Sub_Add_On) 
admin.site.register(Pasta)
admin.site.register(Salad)
admin.site.register(Dinner_Platter)
admin.site.register(Past_Orders)
# Register your models here.
