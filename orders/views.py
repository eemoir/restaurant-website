import ast
import json

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core import serializers
from django.utils import timezone
from tzlocal import get_localzone

from .forms import RegistrationForm

from .models import Regular_pizza, Sicilian_pizza, Topping, Sub, All_Sub_Add_On, Steak_Sub_Add_On, Pasta, Salad, Dinner_Platter, Past_Orders
# Create your views here.

drafts = dict()

models = {
    "Platter": Dinner_Platter,
    "Regular Pizza": Regular_pizza,
    "Sicilian Pizza": Sicilian_pizza,
    "Sub": Sub,
    "Pasta": Pasta,
    "Salad": Salad
}

def index(request):
    context = {
        "Regular_pizzas": Regular_pizza.objects.all(),
        "Sicilian_pizzas": Sicilian_pizza.objects.all(),
        "Toppings": Topping.objects.all(),
        "Subs": Sub.objects.all(),
        "Steak_Add_Ons": Steak_Sub_Add_On.objects.all(),
        "Sub_Add_Ons": All_Sub_Add_On.objects.all(),
        "Pastas": Pasta.objects.all(),
        "Salads": Salad.objects.all(),
        "Dinner_Platters": Dinner_Platter.objects.all(),
    } 
    return render(request, "orders/index.html", context)

def view_cart(request):
    if request.user.is_authenticated:
        user = request.user.username
        context = {
            "Shopping_cart": drafts.get(user)
        }
        return render(request, "orders/cart.html", context)
    else:
        return HttpResponseRedirect(reverse("index"))

def delete_item(request):
    if request.method == "POST":
        body = request.body.decode("utf-8")
        body = ast.literal_eval(body)
        user = request.user.username
        item = body['item']
        if user in drafts:
            for index, thing in enumerate(drafts[user]['items']):
                if checkForItem(thing, item):
                    drafts[user]['items'].pop(index)
                    total = item['total']
                    drafts[user]['total'] = padDecimal(round((float(drafts[user]['total']) - float(total)), 2))
            if len(drafts[user]['items']) == 0:
                drafts[user] = {
                    'items': list(),
                    'total': 0
                }
    return HttpResponseRedirect(reverse("cart"))

def update_cart(request):
    if request.method == "POST":
        body = request.body.decode("utf-8")
        body = ast.literal_eval(body)
        user = request.user.username
        order = body['order']
        update = order['update']
        order['price'] = padDecimal(float(order['price']))
        order['total'] = padDecimal(round((int(order['quantity']) * float(order['price'])), 2))
        print(order['price'])
        print(order['total'])
        duplicate = None
        if user in drafts:
            for thing in drafts[user]['items']:
                if (checkForItem(thing, order)):
                    duplicate = thing
                    print(duplicate)
            if duplicate:
                incrementItem(duplicate, drafts[user], order['quantity'], update)
                return HttpResponseRedirect(reverse("index"))
            else:
                drafts[user]['items'].append(order)
                drafts[user]['total'] = padDecimal(round((float(drafts[user]['total']) + float(order['total'])), 2))
                return HttpResponseRedirect(reverse("index"))
        else:
            drafts[user] = {
                'items': list(),
                'total': None
            }
            drafts[user]['items'].append(order)
            drafts[user]['total'] = padDecimal(round(float(order['total']), 2))
            return HttpResponseRedirect(reverse("index"))

def login(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse("index"))
        else: 
            form = AuthenticationForm()
            return render(request, "orders/login.html", {'message': None, 'form': form})
    else: 
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            auth_login(request, form.get_user())
            return HttpResponseRedirect(reverse("index"))
        else:
            form = AuthenticationForm()
            return render(request, "orders/login.html", {'message': 'Invalid credentials', 'form': form})

def logout(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            auth_login(request, user)
            return HttpResponseRedirect(reverse("index"))
    else: 
        form = RegistrationForm()
    return render(request, "orders/register.html", {'form': form})

def getToppings(request):
    if request.method == 'POST':
        data = serializers.serialize('json', Topping.objects.all())
        return JsonResponse(data, safe=False)

def getSteakExtras(request):
    if request.method == 'POST':
        data = serializers.serialize('json', Steak_Sub_Add_On.objects.all())
        return JsonResponse(data, safe=False)

def submitRepeatOrder(request):
    if request.method == "POST":
        user = request.user.username
        body = request.body.decode("utf-8")
        body = ast.literal_eval(body)
        order = json.dumps(body['order'])
        total = body['total']
        newOrder = Past_Orders.objects.create(user=user, order=order, total=total)
        return render(request, "orders/submit_order.html")
    else: 
        return HttpResponseRedirect(reverse("index"))

def submitOrder(request):
    if request.method == "POST":
        user = request.user.username
        order = json.dumps(drafts.get(user)['items'])
        total = drafts.get(user)['total']
        newOrder = Past_Orders.objects.create(user=user, order=order, total=total)
        del drafts[user]
        return render(request, "orders/submit_order.html")
    else: 
        return HttpResponseRedirect(reverse("index"))

def pastOrders(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("index"))
    else:
        user = request.user.username
        orders = Past_Orders.objects.filter(user=user).order_by('-timestamp').values()
        for order in orders:
            if order['timestamp']:
                time = order['timestamp']
                order['new_time'] = dict()
                time = time.astimezone(get_localzone())
                order['new_time']['date'] = f"{time.month}/{time.day}/{time.year}"
                order['new_time']['time'] = f"{leftPadding(time.hour)}:{leftPadding(time.minute)}"
            order['order'] = json.loads(order['order'])
        return render(request, "orders/history.html", {'past_orders': orders})

def getNewPrice(request):
    if request.method == "POST":
        body = request.body.decode("utf-8")
        body = ast.literal_eval(body)
        item = body['item']
        size = body['size']
        print(item)
        category = body['category']
        newItem = models[category].objects.filter(name=item).values()
        print(newItem[0][size])
        return JsonResponse(newItem[0][size], safe=False)

def checkForItem(draftItem, item):
    category = item['category']
    thing = item['item']
    size = item.get('size')
    toppings = item.get('toppings')
    if draftItem['category'] == category:
        if draftItem['item'] == thing:
            if draftItem.get('size') == size:
                if draftItem.get('toppings') and toppings:
                    for x in range(0, len(toppings)):
                        if sorted(draftItem.get('toppings'))[x] != sorted(toppings)[x]:
                            return False
                    return True
                elif not draftItem.get('toppings') and not toppings:
                    return True
    return False

def incrementItem(item, draft, quantity, update):
    category = item['category']
    thing = item['item']
    size = item.get('size')
    toppings = item.get('toppings')
    price = float(item['price'])
    for stuff in draft['items']:
        if stuff['category'] == category:
            if stuff['item'] == thing:
                if stuff.get('size') == size:
                    if stuff.get('toppings') and toppings:
                        for x in range(0, len(toppings)):
                            if sorted(stuff.get('toppings'))[x] != sorted(toppings)[x]:
                                return False
                        updateQuantity(stuff, draft, quantity, update)
                    elif not stuff.get('toppings') and not toppings:
                        updateQuantity(stuff, draft, quantity, update)
    return False

def updateQuantity(stuff, draft, quantity, update):
    new_quantity = int(quantity)
    if update == 1:
        stuff['quantity'] = stuff['quantity'] + new_quantity
        print(stuff['quantity'])
    else:
        stuff['quantity'] = new_quantity
    stuff['total'] = padDecimal(round((float(stuff['price']) * stuff['quantity']), 2))
    recalculateTotal(draft)

def recalculateTotal(draft):
    total = 0
    for item in draft['items']:
        total = total + float(item['total'])
    draft['total'] = padDecimal(round(total, 2))

def padDecimal(num):
    arr = str(num).split('.')
    if len(arr[-1]) < 2:
        return str(num) + "0"
    elif len(arr[-1]) > 2:
        return str(round(num, 2))
    else:
        return str(num)

def leftPadding(num):
    if int(num) < 10:
        return f"0{str(num)}"
    else:
        return str(num)




