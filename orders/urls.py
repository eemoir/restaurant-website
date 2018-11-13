from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login, name="login"),
    path("register", views.register, name="register"),
    path("logout", views.logout, name="logout"),
    path("toppings", views.getToppings, name="toppings"),
    path("steaksub_toppings", views.getSteakExtras, name="steak"),
    path("update_cart", views.update_cart, name="update_cart"),
    path("shopping_cart", views.view_cart, name="cart"),
    path("submit_order", views.submitOrder, name="submit"),
    path("past_orders", views.pastOrders, name="history"),
    path("delete_item", views.delete_item, name="delete_item"),
    path("get_new_price", views.getNewPrice, name="get_new_price"),
    path("submit_repeat_order", views.submitRepeatOrder, name="submit_repeat_order")
]
