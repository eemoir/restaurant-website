const toppings = ['1-topping', '2-toppings', '3-toppings', 'Special']

const toppingMessages = {
	'Cheese': {
		'Error message': "You have not selected any toppings. Would you like to order a cheese pizza?",
		'Submit message': "No, I would like to select toppings",
		'regular': {
			'small': '12.20',
			'large': '17.45'
		},
		'sicilian': {
			'small': '23.45',
			'large': '37.70'
		}
	},
	'1-topping': {
		'Error message': "You have only selected one topping. Would you like to order a one-topping pizza?",
		'Submit message': "No, I would like to select more",
		'regular': {
			'small': '13.20',
			'large': '19.45'
		},
		'sicilian': {
			'small': '25.45',
			'large': '39.70'
		}
	},
	'2-toppings': {
		'Error message': "You have selected two toppings. Would you like to order a 2-toppings pizza?",
		'Submit message': 'No, I would like to add/remove toppings',
		'regular': {
			'small': '14.70',
			'large': '21.45'
		},
		'sicilian': {
			'small': '27.45',
			'large': '41.70'
		}
	},
	'3-toppings': {
		'Error message': "You have selected three toppings. Would you like to order a 3-toppings pizza?",
		'Submit message': 'No, I would like to add/remove toppings',
		'regular': {
			'small': '15.70',
			'large': '23.45'
		},
		'sicilian': {
			'small': '28.45',
			'large': '43.70'
		}
	},
	'Special': {
		'Error message': 'You have selected more than three toppings. Would you like to order a special pizza?',
		'Submit message': 'No, I would like to add/remove toppings',
		'regular': {
			'small': '17.25',
			'large': '25.45'
		},
		'sicilian': {
			'small': '29.45',
			'large': '44.70'
		}
	},
}

document.addEventListener('DOMContentLoaded', () => {
	let isLoggedIn = document.getElementById('logged-in')
	//if user is logged in, create inputs for menu items
	if (isLoggedIn) {
		let prices = document.querySelectorAll(".price")
		prices.forEach((element) => {
			let info = {
				'size': null,
				'item': element.parentNode.firstChild.innerHTML,
				'price': element.innerHTML.substring(1),
				'category': element.parentNode.parentNode.parentNode.id,
				'quantity': 1,
				'toppings': null
			}
			let i = document.createElement('button')
			i.setAttribute('class', 'add-button')
			i.innerHTML = 'Add'
			if (element.classList.length > 1) {
				info['size'] = element.classList[1]
			}
			i.onclick = () => {
				//if the item to be added is one that involves toppings, create a topping selector form
				if (toppings.includes(info['item'])) {
					let f = document.createElement('form')
					f.setAttribute("class", 'toppings-form')
					//retrieve the list of toppings from the database
					const request = new XMLHttpRequest() 
					request.open("POST", "toppings")
					request.onload = () => {
						let data = request.responseText
						if (data) {
							//for each topping, create either a radio or a checkbox button
							data = JSON.parse(JSON.parse(data))
							data.forEach((topping) => {
								let d = document.createElement('div')
								d.setAttribute("class", "topping-block")
								let i = document.createElement('input')
								i.setAttribute('name', 'topping')
								if (info['item'].substring(0, 1) === "1") {
									i.setAttribute('type', "radio")
								} else {
									i.setAttribute('type', 'checkbox')
								} 
								d.appendChild(i)
								let p = document.createElement('p')
								p.setAttribute("class", 'topping-name')
								p.innerHTML = topping['fields']['name']
								d.appendChild(p)
								f.appendChild(d)
							})
							addQuantity(f)
							let button = document.createElement('button')
							button.setAttribute('class', 'submit-menu-item')
							button.setAttribute('type', 'submit')
							button.innerHTML = "Submit"
							button.setAttribute('method', "GET")
							button.setAttribute('action', "#")
							//when submit button on topping form is clicked, retrieve list of toppings 
							//the user has selected, as well as the quantity
							button.onclick = (e) => {
								getSelectedToppings(f, info, e)
								//check to see if the number of toppings selected matches 
								//what the user said they would like to order.
								//if it does not, prompt them to confirm their choice
								if (info['toppings'].length === 0) {
									info['toppings'] = null
									toppingError(e, "Cheese", info, element, f)
								} else if (info['toppings'].length > 5) {
									e.preventDefault()
									f.querySelector('.submit-error').innerHTML = "You cannot choose more than 5 toppings per pizza."
								} else {
									f.querySelector('.submit-error').innerHTML = ""
									let indicated = info['item'].substring(0, 1)
									let numToppings = info['toppings'].length.toString()
									if (indicated === numToppings || (parseInt(numToppings) > 3 && indicated === "S")) {
										submitToppingItem(info, f)
									} else {
										let newItem
										if (parseInt(numToppings) === 1) {
											newItem = "1-topping"
										}
										else if (parseInt(numToppings) < 4) {
											newItem = numToppings + "-toppings"
										} else {
											newItem = "Special"
										}
										toppingError(e, newItem, info, element, f)
									}
								}
							}
							f.appendChild(button)
							cancelButton(element, f)
							let e = document.createElement('div')
							e.setAttribute('class', 'submit-error')
							f.appendChild(e)
							element.parentNode.parentNode.parentNode.parentNode.nextElementSibling.appendChild(f)
						} else {
							document.querySelector("#error").innerHTML = "Error loading toppings"
						}
					}
					const csrftoken = getCookie('csrftoken')
					request.setRequestHeader('X-CSRFToken', csrftoken)
					request.send()
					return false
				}
				else if (element.parentNode.parentNode.parentNode.id === "sub") {
					let f = document.createElement('form')
					f.setAttribute("class", 'sub-toppings-form')
					if (element.parentNode.firstChild.innerHTML === "Steak + Cheese") {
						getSteakExtras(f)
					}
					extraCheese(f)
					addQuantity(f)
					let d = document.createElement('div')
					d.setAttribute('class', 'button-div')
					let button = document.createElement('button')
					button.setAttribute('class', 'submit-menu-item')
					button.setAttribute('type', 'submit')
					button.innerHTML = "Submit"
					button.setAttribute('method', "GET")
					button.setAttribute('action', "#")
					button.onclick = (e) => {
						getSelectedToppings(f, info, e)
						if (info['toppings'].length > 0) {
							info['price'] = parseFloat(info['price']) + .50*info['toppings'].length
						} else {
							info['toppings'] = null
						}
						submitToppingItem(info, f)
					}
					d.appendChild(button)
					cancelButton(element, d, 1)
					f.appendChild(d)
					element.parentNode.parentNode.parentNode.parentNode.nextElementSibling.appendChild(f)
					return false
				} else {
					submitRegItem(info, element)
					return false
				}
			}
			element.appendChild(i)
		})
	}
	let form = document.getElementById('shopping-cart')
	if (form) {
		let inputs = Array.from(document.getElementsByTagName('input'))
		resizeInputs(inputs)
		form.addEventListener('submit', (e) => {
			if (!document.querySelector('#reviewed').checked) {
				e.preventDefault()
				let p = document.createElement('p')
				p.innerHTML = "Please confirm your order before submitting"
				p.setAttribute('class', 'submit-error')
				form.appendChild(p)
				return false
			} 
		})
	}
	let pastOrders = document.querySelectorAll(".past-order")
	if (pastOrders) {
		let inputs = Array.from(document.getElementsByTagName('input'))
		resizeInputs(inputs)
		Array.from(pastOrders).forEach((form) => {
			let orderTotal = form.querySelector(".order-total")
			let repeatOrder = form.querySelector(".repeat-order")
			let orderItems = form.querySelectorAll(".order-item")
			Array.from(orderItems).forEach((thing) => {
				let category = thing.querySelector(".item-category")
				let item = thing.querySelector(".item")
				let size = thing.querySelector(".item-size")
				let toppings = thing.querySelectorAll(".item-toppings")
				let quantity = thing.querySelector(".item-quantity")
				let price = thing.querySelector(".item-price")
				let itemTotal = thing.querySelector(".item-total")
				let deleteButton = thing.querySelector(".delete-item")
				if (category) {
					category.addEventListener('change', () => {
						let newPrice = toppingMessages[item.value][convertCategory(category.value)][size.value]
						price.value = `$${newPrice}`
						let newItemTotal = (newPrice * parseInt(quantity.value)).toFixed(2)
						itemTotal.value = `$${newItemTotal}`
						recalculateTotal(thing, form, orderTotal)
					})
				}
				if (size) {
					size.addEventListener('change', () => {
						let request = new XMLHttpRequest() 
						request.open("POST", "get_new_price", true)
						request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
						const csrftoken = getCookie('csrftoken')
						request.setRequestHeader('X-CSRFToken', csrftoken)
						request.onload = (data) => {
							let newPrice = JSON.parse(request.responseText)
							console.log(newPrice)
							if (thing.querySelector(".category").value === "Sub") {
								if (toppings) {
									let nodes = thing.querySelector("#toppings-div").childNodes
									let num = 0
										Array.from(nodes).forEach((node) => {
											if (node.nodeName === "INPUT") {
												num++
											}
										})
									let addition = num * .50
									newPrice = (Number(newPrice) + addition).toFixed(2)
									console.log(newPrice)
								}
							}
							price.value = `$${newPrice}`
							itemTotal.value = `$${(parseInt(quantity.value) * newPrice).toFixed(2)}`
							recalculateTotal(thing, form, orderTotal)
						}
						let query = {
								'item': item.value,
								'category': thing.querySelector(".category").value,
								'size': size.value
						}
						request.send(JSON.stringify(query))
					})
				}
				quantity.addEventListener('input', (e) => {
					checkQuantity(Number(quantity.value), e, form)
					let newPrice = (Number(price.value.substring(1)) * parseInt(quantity.value)).toFixed(2)
					itemTotal.value = `$${newPrice}`
					recalculateTotal(thing, form, orderTotal)
				})
				if (deleteButton) {
					deleteButton.addEventListener('click', () => {
						form.removeChild(thing)
						removeDeleteButtons(form)
						recalculateTotal(thing, form, orderTotal)
					})
				}
			})
			repeatOrder.addEventListener('click', () => {
				confirmRepeatOrder(form)
			})
		})
	}
})

function resizeInputs(inputs) {
	inputs.forEach((input) => {
		if (input.type != 'number') {
			let temp = document.createElement('span')
			temp.setAttribute('class', 'temp-element')
			temp.innerHTML = input.value
			document.body.appendChild(temp)
			let width = temp.getBoundingClientRect().width + 5
			input.style.width = width.toString() + "px"
			document.body.removeChild(temp)
		} else {
			input.style.width = "45px"
		}
	})
}

function confirmRepeatOrder(form) {
	let p = document.createElement('p')
	p.innerHTML = "Please confirm that you would like to place this order again"
	let b = document.createElement('button')
	b.setAttribute('type', 'button')
	b.addEventListener('click', () => {
		let request = new XMLHttpRequest() 
		request.open("POST", "submit_repeat_order", true)
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
		const csrftoken = getCookie('csrftoken')
		request.setRequestHeader('X-CSRFToken', csrftoken)
		let order = []
		let nodes = form.childNodes
		console.log(nodes)
		Array.from(nodes).forEach((node) => {
			let item = {} 
			if (node.nodeName === "DIV") {
				item['item'] = node.querySelector(".item").value
				item['category'] = node.querySelector(".item-category").value
				if (node.querySelector(".item-size")) {
					item['size'] = node.querySelector(".item-size").value
				}
				if (node.querySelector(".toppings-div")) {
					let itemToppings = []
					let toppingList = node.querySelector(".toppings-div").childNodes
					Array.from(toppingList).forEach((item) => {
						if (item.nodeName === "INPUT") {
							itemToppings = [...itemToppings, item.value]
						}
					})
					item['toppings'] = itemToppings
				}
				item['price'] = node.querySelector(".item-price").value.substring(1)
				item['quantity'] = node.querySelector(".item-quantity").value
				item['total'] = node.querySelector(".item-total").value.substring(1)
			}
			if (Object.keys(item).length > 0) {
				order = [...order, item]
			}
		})
		let query = {
			'order': order,
			'total': form.querySelector(".order-total").value.substring(8)
		}
		request.send(JSON.stringify(query))
		form.innerHTML = "Your order has been submitted"
	})
	b.innerHTML = "Place order"
	form.appendChild(p)
	form.appendChild(b)
}

function removeDeleteButtons(form) {
	console.log(form.childNodes)
	let nodes = form.childNodes
	let num = 0
	Array.from(nodes).forEach((node) => {
		if (node.nodeName === "DIV") {
			num++
		}
	})
	console.log(num)
	if (num < 2) {
		let item = form.querySelector(".order-item")
		item.removeChild(item.querySelector(".delete-item"))
	}
}

function deleteItem(element) {
	let order = {}
	order['category'] = element.parentNode.querySelector('.category').innerHTML
	order['item'] = element.parentNode.querySelector('.item').innerHTML
	order['total'] = Number(element.parentNode.querySelector('.item-total').innerHTML.slice(4))
	if (getItemToppings(element) != undefined) {
		order['toppings'] = getItemToppings(element)
	}	if (element.parentNode.querySelector('.size').innerHTML != "") {
		order['size'] = trimParen(element.parentNode.querySelector('.size').innerHTML)
	}
	let request = new XMLHttpRequest() 
	request.open("POST", "delete_item", true)
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
	const csrftoken = getCookie('csrftoken')
	request.setRequestHeader('X-CSRFToken', csrftoken)
	let query = {
		'item': order
	}
	request.send(JSON.stringify(query))
	let child = element.parentNode
	let parent = child.parentNode
	parent.removeChild(child)
	let orderTotal = Number(document.querySelector(".cart-price").innerHTML.slice(1))
	let newTotal = decimalPad(orderTotal - order['total'])
	if (newTotal === "0.00") {
		document.body.removeChild(document.querySelector("#shopping-cart"))
		let p = document.createElement('p')
		p.innerHTML = "Nothing in the cart!"
		document.body.appendChild(p)
	} else {
		document.querySelector(".cart-price").innerHTML = `$${newTotal}`
	}
}

function changeQuantity(element) {
	let num = element.value
	if (!Number.isInteger(Number(num)) || parseInt(num) < 0 || num === "") {
		disableSubmission(1)
	} else if (parseInt(num) > 20) {
		disableSubmission(0)
	} else {
		let itemPrice = Number(element.parentNode.querySelector('.price').innerHTML.slice(1))
		let itemTotal = (itemPrice * Number(num)).toFixed(2)
		element.parentNode.querySelector('.item-total').innerHTML = ` = $${itemTotal}`
		let itemTotals = document.querySelectorAll('.item-total')
		let newTotal = 0
		Array.from(itemTotals).forEach((element) => {
			let total = Number(element.innerHTML.slice(4))
			newTotal += total
		})
		newTotal = decimalPad(newTotal)
		document.querySelector(".cart-price").innerHTML = `$${newTotal}`
		let thing = {}
		if (getItemToppings(element) != undefined) {
			thing['toppings'] = getItemToppings(element)
		}
		if (element.parentNode.querySelector('.size').innerHTML != "") {
			thing['size'] = trimParen(element.parentNode.querySelector('.size').innerHTML)
		}
		thing['category'] = element.parentNode.querySelector('.category').innerHTML
		thing['item'] = element.parentNode.querySelector('.item').innerHTML
		thing['price'] = element.parentNode.querySelector('.price').innerHTML.slice(1)
		thing['quantity'] = num
		thing['update'] = 0
		updateCart(thing)
		enableSubmission()
	}
}

function getItemToppings(element) {
	let toppings
	let toppingsDiv = element.parentNode.querySelector('.toppings')
	if (toppingsDiv) {
		toppings = []
		let children = toppingsDiv.childNodes
		toppingsDiv.childNodes.forEach((node) => {
			toppings.push(node.innerHTML)
		})
	}
	return toppings
}

function disableSubmission(num) {
	document.getElementById("submit-order-button").disabled = true
	if (num) {
		document.getElementById("quantity-error").innerHTML = "Invalid quantity"
	} else {
		document.getElementById("quantity-error").innerHTML = "Please call us to place an order of this size"
	}
}

function enableSubmission() {
	document.getElementById("submit-order-button").disabled = false
	document.getElementById("quantity-error").innerHTML = ""
}

function addToCart(info) {
	let newCategory
	if (info['category'] === "regular") {
		newCategory = "Regular Pizza"
	} else if (info['category'] === "sicilian") {
		newCategory = "Sicilian Pizza"
	} else {
		newCategory = capitalizeFirstLetter(info['category'])
	}
	let order = {
		'category': newCategory,
		'item': info['item'],
		'quantity': info['quantity'],
		'price': info['price'],
		'update': 1
	}
	if (info['toppings']) {
		order['toppings'] = info['toppings']
	}
	if (info['size']) {
		order['size'] = info['size']
	}
	updateCart(order)
}

function addQuantity(form) {
	let quantity = document.createElement('div')
	let p = document.createElement('p')
	p.innerHTML = "Quantity: "
	quantity.appendChild(p)
	let i = document.createElement('input')
	quantity.setAttribute('class', 'quantity')
	i.setAttribute('class', 'quantity')
	i.setAttribute('type', 'number')
	i.setAttribute('min', '1')
	i.setAttribute('max', '20')
	i.setAttribute('value', '1')
	quantity.appendChild(i)
	form.appendChild(quantity)
}

function updateCart(order) {
	let request = new XMLHttpRequest() 
	request.open("POST", "update_cart", true)
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
	const csrftoken = getCookie('csrftoken')
	request.setRequestHeader('X-CSRFToken', csrftoken)
	let query = {
		'order': order
	}
	request.send(JSON.stringify(query))
}

function cancelButton(element, form, type) {
	let cancelButton = document.createElement('button')
	cancelButton.innerHTML = "Cancel"
	if (type) {
		cancelButton.onclick = () => {
			let toRemove = form.parentNode
			element.parentNode.parentNode.parentNode.parentNode.nextElementSibling.removeChild(toRemove)
		}
	} else {
		cancelButton.onclick = () => {
			element.parentNode.parentNode.parentNode.parentNode.nextElementSibling.removeChild(form)
		}
	}
	form.appendChild(cancelButton)
}

function getCookie(name) {
	let cookieValue = null
	if (document.cookie && document.cookie !== '') {
		let cookies = document.cookie.split(';')
		for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i].trim()
			if (cookie.substring(0, name.length+1) === (name + "=")) {
				cookieValue = decodeURIComponent(cookie.substring(name.length+1))
				break
			}
		}
	}
	return cookieValue
}

function getSelectedToppings(form, info, event) {
	let toppings = form.children
	info['toppings'] = []
	Array.from(toppings).forEach((topping) => {
		if (topping.classList[0] === "topping-block" || topping.classList[0] === "sub-topping-block") {
			if (topping.firstChild.checked) {
				info['toppings'] = [...info['toppings'], topping.lastChild.innerHTML]
			}
		} else if (topping.classList[0] === 'quantity') {
			info['quantity'] = Number(topping.lastChild.value)
			checkQuantity(info['quantity'], event, form)
		}
	})
}

function getSteakExtras(form) {
	const request = new XMLHttpRequest() 
	request.open("POST", "steaksub_toppings")
	request.onload = () => {
		let data = request.responseText
		if (data) {
			data = JSON.parse(JSON.parse(data))
			for (let l = 0; l < data.length; l++) {
				let d = document.createElement('div')
				d.setAttribute("class", "sub-topping-block")
				let i = document.createElement('input')
				i.setAttribute('type', 'checkbox')
				i.setAttribute('name', 'sub-extra')
				d.appendChild(i)
				let p = document.createElement('p')
				p.setAttribute("class", 'topping-name')
				p.innerHTML = `${data[l]['fields']['name']} (+ $${data[l]['fields']['price']})`
				d.appendChild(p)
				form.insertBefore(d, form.firstChild)
			}
		} else {
			document.querySelector("#error").innerHTML = "Error loading toppings"
		}
	}
	const csrftoken = getCookie('csrftoken')
	request.setRequestHeader('X-CSRFToken', csrftoken)
	request.send()
}

function extraCheese(form) {
	let d = document.createElement('div')
	d.setAttribute("class", "sub-topping-block")
	let i = document.createElement('input')
	i.setAttribute('type', 'checkbox')
	i.setAttribute('name', 'sub-extra')
	d.appendChild(i)
	let p = document.createElement('p')
	p.setAttribute("class", 'topping-name')
	p.innerHTML = "Extra Cheese (+ $.50)"
	d.appendChild(p)
	form.appendChild(d)
}

function checkQuantity(quantity, event, form) {
	if (!Number.isInteger(quantity) || quantity < 0) {
		event.preventDefault()
		form.querySelector('.submit-error').innerHTML = "Invalid quantity"
	}
	if (quantity > 20) {
		event.preventDefault()
		form.querySelector('.submit-error').innerHTML = "Please call us to place an order of this size"
	}
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function emptyForm(e) {
	while (e.hasChildNodes()) {
		e.removeChild(e.lastChild)
	}
	e.setAttribute('class', '#')
	addSubmitMessage(e, 1)
	let clearForm = setInterval(function() {
		e.parentNode.removeChild(e)
		clearInterval(clearForm)
	}, 1000)
}

function addSubmitMessage(e, type) {
	let m = document.createElement('p')
	m.innerHTML = "Item added to cart"
	m.setAttribute('class', 'submit-message')
	if (type === 1) {
		let table = e
		table.appendChild(m)
	} else if (type === 2) {
		let table = e.target.parentNode.parentNode
		table.appendChild(m)
	} else {
		let table = e.parentNode.parentNode
		table.insertBefore(m, e.parentNode.nextElementSibling)
	}
	m.style.animationPlayState = 'running'
	m.addEventListener('animationend', () =>  {
        m.remove()
    })
}

function trimParen(str) {
	return str.slice(1, str.length-1)
}

function decimalPad(str) {
	str = str.toString()
	let arr = str.split(".")
	if (arr.length === 1) {
		return `${str}.00`
	} else if (arr[1].length < 2) {
		return `${arr[0]}.${arr[1]}0`
	} else if (arr[1].length > 2) {
		return `${Number(str).toFixed(2)}`
	} else {
		return str
	}
}

function toppingError(event, type, info, element, form) {
	event.preventDefault()
	let f2 = document.createElement('form')
	let p = document.createElement('p')
	let d = document.createElement('div')
	let b1 = document.createElement('button')
	b1.setAttribute("type", "button")
	b1.innerHTML = "Yes"
	b1.addEventListener('click', () => {
		info['item'] = type
		info['price'] = toppingMessages[type][info['category']][info['size']]
		addToCart(info)
		addSubmitMessage(event, 2)
		element.parentNode.parentNode.parentNode.parentNode.nextElementSibling.removeChild(form)
	})
	let b2 = document.createElement('button')
	b2.setAttribute("type", "button")
	b2.innerHTML = toppingMessages[type]['Submit message']
	b2.addEventListener('click', () => {
		form.querySelector(".submit-error").removeChild(f2)
	})
	p.innerHTML = toppingMessages[type]['Error message']
	f2.appendChild(p)
	d.appendChild(b1)
	d.appendChild(b2)
	f2.appendChild(d)
	form.querySelector(".submit-error").appendChild(f2)
}

function recalculateTotal(item, form, orderTotal) {
	let prices = form.querySelectorAll(".item-total")
	console.log(prices)
	let finalPrice = 0
	Array.from(prices).forEach((price) => {
		console.log(price.value.substring(1))
		finalPrice+=Number(price.value.substring(1))
		console.log(finalPrice)
	})
	console.log(finalPrice)
	orderTotal.value = `Total: $${finalPrice.toFixed(2)}`
}

function submitToppingItem(info, form) {
	addToCart(info)
	emptyForm(form)
	return false
}

function submitRegItem(info, element) {
	addToCart(info)
	addSubmitMessage(element, 0)
}

function convertCategory(string) {
	let arr = string.split(" ")
	return arr[0].toLowerCase()
}