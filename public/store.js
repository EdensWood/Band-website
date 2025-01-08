// Purpose: To create a shopping cart for the website

//This code checks to mae sure that the page is fully loaded before running the code
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

//This function is called when the page is fully loaded
function ready() {

    //This code is used to remove items from the cart
    var removeCartItemButtons= document.getElementsByClassName('btn-danger')
    console.log(removeCartItemButtons)
    for(var i =0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    //This code is used to change the quantity of items in the cart
    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for(var i =0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    //This code is used to add items to the cart
    var addToCartButtons = document.getElementsByClassName('shop-item-btn')
    for(var i =0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    //This code is used to purchase items in the cart
    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

var stripeHandler = StripeCheckout.configure({ 
    key: stripePublicKey,
    locale: 'auto',
    token: function(token){
        
        var items = []
        var cartItemContainer = document.getElementsByClassName('cart-items')[0]
        var cartRows = cartItemContainer.getElementsByClassName('cart-row')
        for(var i = 0; i < cartRows.length; i++){
            var cartRow = cartRows[i]
            var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
            var quantity = quantityElement.value
            var id = cartRow.dataset.itemId
            items.push({
                id: id,
                quantity: quantity
            })
        }
        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(res){
            return res.json()
        }).then(function(data){
            alert(data.message)
            var cartItems = document.getElementsByClassName('cart-items')[0]
            while(cartItems.hasChildNodes()){
                cartItems.removeChild(cartItems.firstChild)
            }
            updateCartTotal()
        }).catch(function(error){
            console.error(error)
        })
    }
})


//This function is called when the purchase button is clicked
function purchaseClicked(){
    // alert('Thank you for your purchase')
    // var cartItems = document.getElementsByClassName('cart-items')[0]
    // while(cartItems.hasChildNodes()){
    //     cartItems.removeChild(cartItems.firstChild)
    // }
    // updateCartTotal()
    var priceElement = document.getElementsByClassName('cart-total-price')[0]
    var price= parseFloat(priceElement.innerText.replace('$', '')) * 100
    stripeHandler.open({
        amount: price
    })
}


//This function is called when the remove button is clicked
function removeCartItem(event){
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

//This function is called when the quantity of an item is changed
function quantityChanged(event){
    var input = event.target
    if(isNaN(input.value) || input.value <= 0){
        input.value = 1
    }
    updateCartTotal()
}


//This function is called when the add to cart button is clicked
function addToCartClicked(event){
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    var id = shopItem.dataset.itemId
    addItemToCart(title, price, imageSrc,id)
    updateCartTotal()
}

//This function is called when an item is added to the cart
function addItemToCart(title, price, imageSrc, id){
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var carItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < carItemNames.length; i++){
        if(carItemNames[i].innerText == title){
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img src="${imageSrc}" class="cart-item-image" width="100", height="100">
            <span class="cart-item-title">${title}</span>
        </div>
         
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)

    //This code is used to add the event listeners to the cart
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}


//This function is called when the cart total is updated
function updateCartTotal(){
    var carItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows= carItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for(var i = 0; i < cartRows.length; i++){
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}