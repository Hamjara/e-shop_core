var cart = {}; //корзина
var categories = {}; //все возможные категории
var activeCategories = {}; //выбранные пользователем категори
var goods;

//скрипты начнут работать только после загрузки всего документа
$('document').ready(function () {
    loadJson();
});

var loadJson = function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            initShop(response);    }
    }
    xhr.open("GET", 'https://cors-escape.herokuapp.com/https://drive.google.com/uc?authuser=0&id=1HdV62rt74R_BqLCQC96AGoeeHD9ZYILE&export=download');
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.send();
}

function initShop(response) {
    goods = response;
    loadGoods();
    viewCategories();
    initPriceSlider();
    initWeightSlider();
    showMiniCart();
    initSearch();
    initEventsListeners ();
}

//вспомогательная функция для определения пустой ли обьект
function isEmpty (obj) {
        for (var key in obj) {
            return false;
        }
        return true;
}
//функция загрузки товаров и вывода их на страничку
function loadGoods() {
    //загружаю товары на страницу из JSON и вывожу
        var item = '';
        categories = {};
        for(var key in goods) {
            item += `<div class="item" href='item_page.html' data-popularity='${goods[key]['popularity']}' data-category="${goods[key]['category']}" id='${key}'>`;
            item += `<h3> ${goods[key]['name']} </h3>`;
            item += `<p> Цена: <b>${goods[key]['cost']}</b></p>`;
            item += `<p> Вес: <i>${goods[key]['weight']}</i></p>\``;
            item += `<img src="${goods[key]['image']}" alt="Картинка товара">`;
            item += `<button class="add-to-cart" data-art='${key}'>Купить</button>`;
            item += `</div>`;
        }
        $('main').html(item);
        setReferences();
}

function initEventsListeners () {
    $('.filter .category li button.filter').on('click', showOnCategory);
    //для кнопки сброса
    $('#wipe').on('click', wipe);
    //для кнопки покупки в карточке товара
    $('.add-to-cart').on('click', addToCart);
    //для очистки корзины
    $('.mini-cart #clearCart').on('click', clearMiniCart);
    //для кнопок сортировки
    $('.sort-by-cost .inc').on('click', sortByCostInc);
    $('.sort-by-cost .dec').on('click', sortByCostDec);
    $('.sort-by-weight .inc').on('click', sortByWeightInc);
    $('.sort-by-weight .dec').on('click', sortByWeightDec);
    $('.sort-by-popularity .inc').on('click', sortByPopularityInc);
    $('.sort-by-popularity .dec').on('click', sortByPopularityDec);

    $("#search").on('keyup', initSearch);

    $('#showCart').on('click', showCart);
}


function viewCategories () {
    for(var key in goods){
        if( goods[key]['category'] in categories){
            categories[goods[key]['category']]++;
        }
        else {
            categories[goods[key]['category']] = 1;
        }
    }
    var cat = '';
    for(var i in categories) {
        cat += `<li><button class="filter" id="${i}">${i} (${categories[i]})</button></li>`;
    }
    cat += `<li><button id="wipe">Сбросить</button></li>`;
    $('.filter .category').html(cat);
}

//функция отображения товаров в соответствии с категориями
function showOnCategory() {
    //для начала скрываем все карточки товаров
    $('.item').hide();
    var get_id = this.id;
    //когда категория снимается
    if (activeCategories[get_id] !== undefined) {
        delete activeCategories[get_id];
        $('button#' + get_id).css('background-color', 'unset');

    }
    //когда категория ставится
    else {
        activeCategories[get_id] = get_id;
        $('li #' + get_id).css('background-color', 'bisque');
    }
    //показываю товары в зависимости от категории
    for (var i in activeCategories){
        var get_current = $('[data-category = ' + i + ']');
        get_current.show();
    }
    //показываю все товары если не выбрана категория
    if(isEmpty(activeCategories)) {
        $('.item').show();
    }
    // initSearch ();
};

//функция сброса всех категорий и перезагруки слайдера
function wipe(){
    for (var i in activeCategories) {
        delete activeCategories[i];
    }
    $('aside ul li button').css('background-color', 'unset');
    $('.item').show();
    initPriceSlider();
    initWeightSlider();
};

//инициализация слайдера
function initPriceSlider() {
    //слайдер который я "одолжил" и поднастроил
    $("#price-slider-range").slider({
        range: true,
        min: 0,
        max: 500,
        values: [0, 500],
        slide: function (event, ui) {
            $("#price-amount").val("₽" + ui.values[0] + " - ₽" + ui.values[1]);
            //шорткаты для большего и меньшего значения ползунков
            var minPrice = ui.values[0];
            var maxPrice = ui.values[1];
            $('.item p b').each(function () {
                //делаю шорткаты для тегов и значений аттрибутов
                var item = $(this).parent().parent();
                var cat = item.attr('data-category');
                var price = $(this)[0].innerHTML;
                //если товары не в диапазоне - скрываю
                if (+price < +minPrice || +price > +maxPrice) {
                    item.hide();
                }
                //если расставлены категории и товары под них подходят - показываю
                else if ((+price > +minPrice || +price < +maxPrice) && (activeCategories[cat] !== undefined)) {
                    item.show();
                }
                //если категории не выбраны показываю все
                else if ((+price > +minPrice || +price < +maxPrice) && (isEmpty(activeCategories))) {
                    item.show();
                }
            })
        }
    });
    //вывод слайдера
    $("#price-amount").val("₽" + $("#price-slider-range").slider("values", 0) +
        " - ₽" + $("#price-slider-range").slider("values", 1));
}

function initWeightSlider() {
    //слайдер веса
    var minWeight;
    var maxWeight;
    $( "#weight-slider-range" ).slider({
        range: true,
        min: 0,
        max: 2000,
        values: [ 0, 2000 ],
        slide: function( event, ui ) {
            $( "#weight-amount" ).val(ui.values[ 0 ] + "г" + " - " + ui.values[ 1 ] + "г");
            //шорткаты для большего и меньшего значения ползунков
            minWeight = ui.values[ 0 ];
            minWeight = ui.values[ 1 ];
            $('.item p i').each( function () {
                //делаю шорткаты для тегов и значений аттрибутов
                var item = $(this).parent().parent();
                var cat = item.attr('data-category');
                var weight = $(this)[0].innerHTML * 1000;
                //если товары не в диапазоне - скрываю
                if ( +weight < +minWeight || +weight > +maxWeight) {
                    item.hide();
                }
                //если расставлены категории и товары под них подходят - показываю
                else if ( (+weight > +minWeight || +weight < +maxWeight) && (activeCategories[cat] !== undefined) ) {
                    item.show();
                }
                //если категории не выбраны показываю все
                else if ( (+weight > +minWeight || +weight < +maxWeight) && (isEmpty(activeCategories)) ) {
                    item.show();
                }
            })
        }
});
//вывод слайдера
$( "#weight-amount" ).val( $( "#weight-slider-range" ).slider( "values", 0 ) + "г" +
    " - " + $( "#weight-slider-range" ).slider( "values", 1 ) + "г");
}

function checkMiniCart() {
    //проверяю наличие корзины в localStorage
    if (localStorage.getItem('cart') !== null) {
        cart = JSON.parse(localStorage.getItem('cart'));
    }
}

function addToCart() {
    //добавляю товары в корзину по кнопке
    var art = $(this).attr('data-art');
    if(art in cart) {
        cart[art]++;
    }
    else {
        cart[art] = 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    showMiniCart();
}

function showMiniCart() {
    //показываю содержимое корзины
    checkMiniCart();
    if (isEmpty(cart)){
        $('.mini-cart ul').html('<li><i class="empty">Пока что тут пусто</i></li>');
    }
    else {
        var out ='';
        console.log(goods);
        for(var i in cart) {
            var name = goods[i]['name'];
            out += `<li><div><b class="times" data-art="${i}">&times;&nbsp;</b>${name}:</div>
                <div><span class="cart-dec" data-art="${i}">&nbsp;-&nbsp;</span><span>${cart[i]}
                </span id=><span class="cart-inc" data-art="${i}">&nbsp;+&nbsp;</span></div></li>`;
        }
        $('.mini-cart ul').html(out);
    }
    //для кнопок увеличения количества товара на главной странице
    $('.sidebar span.cart-inc').on('click', miniCartItemsInc);
    $('.sidebar span.cart-dec').on('click', miniCartItemsDec);
    //для удаления товара
    $('.times').on('click', function() {
        var get_id = $(this).attr('data-art');
        delete cart[get_id];
        localStorage.setItem('cart', JSON.stringify(cart));
        showMiniCart();
    });
}

function clearMiniCart() {
    localStorage.removeItem('cart');
    $('.mini-cart ul').html('');
    for (var i in cart) {
        delete cart[i];
    }
    $('.mini-cart ul').html('<li><i class="empty">Пока что тут пусто</i></li>');
}

function sortByCostInc() {
    var items = $('main .item');
    var target = $('main')
    items.sort( function (a, b) {
        var aPrice = a.getElementsByTagName('b')[0].innerText;
        var bPrice = b.getElementsByTagName('b')[0].innerText;
        if (aPrice > bPrice){
            return 1;
        }
        if (aPrice < bPrice){
            return -1;
        }
        return 0;
    })
    console.log(items);
    items.detach().appendTo(target);
}

function sortByCostDec() {
    var items = $('main .item');
    var target = $('main')
    items.sort( function (a, b) {
        var aPrice = a.getElementsByTagName('b')[0].innerText;
        var bPrice = b.getElementsByTagName('b')[0].innerText;
        if (aPrice > bPrice){
            return -1;
        }
        if (aPrice < bPrice){
            return 1;
        }
        return 0;
    })
    console.log(items);
    items.detach().appendTo(target);
}

function sortByWeightInc() {
    var items = $('main .item');
    var target = $('main');
    items.sort( function (a, b) {
        var aWeight = a.getElementsByTagName('i')[0].innerText;
        var bWeight = b.getElementsByTagName('i')[0].innerText;
        if (aWeight > bWeight){
            return 1;
        }
        if (aWeight < bWeight){
            return -1;
        }
        return 0;
    })
    console.log(items);
    items.detach().appendTo(target);
}

function sortByWeightDec() {
    var items = $('main .item');
    var target = $('main');
    items.sort( function (a, b) {
        var aWeight = a.getElementsByTagName('i')[0].innerText;
        var bWeight = b.getElementsByTagName('i')[0].innerText;
        if (aWeight > bWeight){
            return -1;
        }
        if (aWeight < bWeight){
            return 1;
        }
        return 0;
    })
    console.log(items);
    items.detach().appendTo(target);
}

function sortByPopularityInc() {
    var items = $('main .item');
    var target = $('main');
    items.sort( function (a, b) {
        var aPopularity = a.getAttribute('data-popularity');
        var bPopularity = b.getAttribute('data-popularity');
        if (aPopularity > bPopularity){
            return 1;
        }
        if (aPopularity < bPopularity){
            return -1;
        }
        return 0;
    });
    items.detach().appendTo(target);
}

function sortByPopularityDec() {
    var items = $('main .item');
    var target = $('main');
    items.sort( function (a, b) {
        var aPopularity = a.getAttribute('data-popularity');
        var bPopularity = b.getAttribute('data-popularity');
        if (aPopularity > bPopularity){
            return -1;
        }
        if (aPopularity < bPopularity){
            return 1;
        }
        return 0;
    })
    items.detach().appendTo(target);
}

function miniCartItemsInc() {
    var get_id = $(this).attr('data-art');
    cart[get_id]++;
    localStorage.setItem('cart', JSON.stringify(cart));
    showMiniCart();
}

function miniCartItemsDec() {
    var get_id = $(this).attr('data-art');
    cart[get_id]--;
    if(cart[get_id] <= 0){
        cart[get_id] = 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    showMiniCart();
}

function setReferences() {
    $('.item').on('click', function(event){
        if (event.target !== this.getElementsByTagName('button')[0]){
            $('.filter').addClass('disabled');
            $('.top-bar').addClass('disabled');
            var get_id = this.id;
                var item = '';
                item += `<div class="item-on-page">`;
                item += `<button class="back">Назад в магазин</button>`;
                item += `<h1> ${goods[get_id]['name']} </h1>`;
                item += `<img src="${goods[get_id]['image']}" alt="Картинка товара">`;
                item += `<div><p> Цена: <b>${goods[get_id]['cost']}</b></p></div>`;
                item += `<div><p> Вес: <i>${goods[get_id]['weight']}</i></p></div>`;
                item += `<div><p> Популярность: ${goods[get_id]['popularity']}</p></div>`;
                item += `<div class="description"><p> ${goods[get_id]['fullDescription']} </p></div>`;
                item += `<button class="add-to-cart" data-art='${get_id}'>Добавить в корзину</button>`;
                item += `<div class='mark'></div>`;
                item += `</div>`;
                $('main').html(item);
                $('.add-to-cart').on('click', addToCart);
                $('.back').on('click', function () {
                    $('.filter').removeClass('disabled');
                    $('.top-bar').removeClass('disabled');
                    loadGoods();
                    $('.add-to-cart').on('click', addToCart);
                });
        }
    });
}

function initSearch () {
    _this = $('#search')[0];

        $.each($('.item h3'), function() {
            if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1) {
                $(this).parent().hide();
            }
            else {
                $(this).parent().show();
            }
            })

}


function showCart() {
    $('.sidebar').addClass('disabled');
    $('.top-bar').addClass('disabled');
    var out ='';
    var finalWeight = 0;
    var finalCost = 0;
    out += `<div class="cart-field"><div class="cart">`;
    for(var i in cart) {
        finalWeight += goods[i]['weight'] * cart[i];
        finalCost += goods[i]['cost'] * cart[i];
        out += `<div class='cart-item'>`;
        out += `<div><button class="delete" id="${[i]}">Удалить</button></div>`;
        out += `<img src='${goods[i]["image"]}' alt="">`;
        out += `<div><h4>${goods[i]['name']}</h4></div>`;
        out += `<div><p>${goods[i]['shortDescription']}</p></div>`;
        out += `<div><p>Цена: <span>${goods[i]['cost'] * cart[i]}</span></p></div>`;
        out += `<div><p>Вес: <span>${(goods[i]['weight'] * cart[i]).toFixed(1)}</span></p></div>`;
        out += `<div>Количество:&nbsp;<span class="cart-dec" data-art="${i}">&nbsp;-&nbsp;</span><span>${cart[i]}
                </span id=><span class="cart-inc" data-art="${i}">&nbsp;+&nbsp;</span></div>`;
        out += `</div>`;
    }
    out += `</div><div class='final'>`;
    out += `<div><p>Итоговый вес покупки: <b>${finalWeight.toFixed(1)}</b></p></div>`;
    out += `<div><p>Общая стоимость: <b>${finalCost}</b></p></div>`;
    out += `</div>`;

    out += `<div class="cart-buttons">`;
    out += `<buttton class="finish">Оформить заказ</buttton>`;
    out += `<button class="back">Назад в магазин</button>`;
    out += `</div></div>`;
    $('main').html(out);

    if (isEmpty(cart)){
        $('.cart').html('<i class="empty">Пока что тут пусто</i>');
    }
    $('.cart-item span.cart-inc').on('click', itemsInc);
    $('.cart-item span.cart-dec').on('click', itemsDec);

    $('button.back').on('click', function () {
        $('.sidebar').removeClass('disabled');
        $('.top-bar').removeClass('disabled');
        loadGoods();
        $('.add-to-cart').on('click', addToCart);
    });

    $('.delete').on('click', function() {
        var get_id = this.id;
        delete cart[get_id];
        localStorage.setItem('cart', JSON.stringify(cart));
        showCart();
        showMiniCart();
    });

    function itemsInc() {
        var get_id = $(this).attr('data-art');
        cart[get_id]++;
        localStorage.setItem('cart', JSON.stringify(cart));
        showCart();
        showMiniCart();
    }

    function itemsDec() {
        var get_id = $(this).attr('data-art');
        cart[get_id]--;
        if(cart[get_id] <= 0){
            cart[get_id] = 1;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        showCart();
        showMiniCart();
    }
}
