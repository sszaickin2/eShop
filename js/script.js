const API_ROOT = 'http://localhost:3000/api';
const request = (path = '', method = "GET", body) => {
    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();


        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    console.error(xhr.responseText);
                    reject(xhr.responseText);
                }

            }
        }

        xhr.open(method, `${API_ROOT}/${path}`);

        if (method === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }

        xhr.send(body);
    });
}

Vue.component('goods-list', {

    props: ['filtedGoods'],

    template: `
   <section class="goods">
      <goods-item 
         v-for = "item in filtedGoods" 
         v-bind:key = "item.id" 
         v-bind:item = "item"
         v-on:add = "$emit('add-item', $event)">
      </goods-item>

      <goods-empty v-if = "filtedGoods.length === 0"/>

   </section>
   `,

});

Vue.component('goods-item', {
    props: ['item'],
    template: `
   <div class = "item">
      <div class="fetured__image--style">
        <img :src="'../img/fetured/' + item.image" alt="img" class="products__one--image">
      <div class="fetured__link--store">
         <a class = "link__store" name = "add-to-basket" v-on:click.prevent = "$emit('add', item)">
      <img class="link__store--image" src="img/fetured/buy.svg" alt="">Add to Cart</a>
      </div>
      </div>

      <div class="fetured__text">
         <h2 class="products__one--headline"> {{ item.title }} </h2>
         <p class="products__one--text"> {{ item.text }} </p>
         <p class="products__one--price">$ {{ item.price }} </p>
      </div>


   </div>
   `,
});

Vue.component('goods-empty', {
    template: `
   <div class = "goods--empty">
         Нет таких товаров
   </div>
   `,
});

Vue.component('goods-search', {

    props: ['value'],

    template: `
      <input v-bind:value = "value" v-on:input = "handleInput" type="text" class = "header__search">
   `,

    methods: {
        handleInput(event) {
            this.$emit('change', event.target.value);
        },
    }
});

Vue.component('goods-basket', {

    props: ['goods', 'total'],

    template: `

      <div class="card__mango">
      
      <div class="basket-item" v-for="item in goods">
      
      <img v-on:click="$emit('remove-item' ,item.id)" class="clouse__image" src="img/card/cardclouse.svg">
      
        <div class="mango__img">
         <img :src="'../img/fetured/' + item.image" alt="img" class="mango__image">
         </div>
          
          <div class="mango__text">
           <div class="mango__headline">{{ item.title }}</div>
            <div class="mango__price"> Price: <span class="mango__number">$ {{ item.price }}</span> </div>
             <div class="mango__color">Color: <span class="mango__red">Red</span></div>
             <div class="mango__size">Size: <span class="mango__xl">Xl</span></div>
            <div class="mango__quantity">Quantity:<span class="quantity__number">{{ item.quantity }}</span></div>
          </div> 
      </div>
      </div>
      
   `
});

Vue.component('v-error', {
    template: `
      <div class = "error">Что-то пошло не так</div>
   `
});

new Vue({
    el: '#app',
    data: {
        goods: [],
        searchValue: '',
        basketGoods: [],
        isBasketVisable: true,
        isError: false,
        isElVisible: false,
        isElVis: false,
    },

    created() {
        this.fetchGoods();
        this.fethBasket();
    },

    computed: {

        filtedGoods() {
            const regexp = new RegExp(this.searchValue, 'i');
            return this.goods.filter((goodsItem) => regexp.test(goodsItem.title));
        },
        volume() {
            return this.basketGoods.reduce((accu, currEl) => accu + (currEl.quantity), 0);
        },
        total() {
            return this.basketGoods.reduce((accumulator, currentElement) => accumulator + (currentElement.price * currentElement.quantity), 0);
        },
    },


    methods: {

        async fetchGoods() {
            try {
                const res = await fetch(`${API_ROOT}/goods`);
                const goods = await res.json();
                this.goods = goods;
            } catch (error) {
                console.log(`Can't fetch data`, error);
                this.isError = true;
                throw new Error(error)
            }
        },


        fethBasket() {
            request('basket-goods')
                .then((goods) => {
                    this.basketGoods = goods.contents;
                })
                .catch((error) => {
                    console.log(`Can't fetch basket data`, error);
                    this.isError = true;
                });
        },

        tutorial() {
            return this.basketGoods
        },


        addItem(item) {
            fetch(`${API_ROOT}/basket-goods`, {
                method: 'POST',
                body: JSON.stringify(item),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                    if (response.result !== 0) {
                        const itemIndex = this.basketGoods.findIndex((goodsItem) => goodsItem.id === item.id);
                        if (itemIndex > -1) {
                            this.basketGoods[itemIndex].quantity += 1;
                        } else {
                            this.basketGoods.push({...item, quantity: 1});
                        }
                        console.log(this.basketGoods);
                    } else {
                        console.error(`Can't add item to basket`, item, this.basketGoods);
                    }
                });
        },


        async handleRemoveItem(id) {
            const rawResponse = await fetch(`${API_ROOT}/basket-goods/${id}`, {
                method: 'DELETE',
            });

            const response = await rawResponse.json();

            if (response.result !== 0) {
                this.basketGoods = this.basketGoods.filter((goodsItem) => goodsItem.id !== parseInt(id));
                console.log(this.basketGoods);
            } else {
                console.error(`Can't remove item to basket`, item, this.basketGoods);
            }

        },


        toggleElement() {
            this.isElVisible = !this.isElVisible;
        },

        deleteElement() {
            this.isElVisible = false;
            this.isElVis = false;
        },

        toggleIsVis() {
            this.isElVis = !this.isElVis;
        },

    },
});


const catalogButton = document.querySelector('.store__burger--menu');
const catalogModal = document.querySelector('.store__menu ');
const catalogActive = document.querySelector('.store__burger ')

if (catalogButton) {
    catalogButton.addEventListener('click', () => {
        catalogModal.classList.toggle('_lock');
        catalogActive.classList.toggle('_active');
    });
}

let next = document.getElementById('next-btn'),
    prev = document.getElementById('prev-btn'),
    slider = document.getElementsByClassName('img__slider'),
    sliderIndex = 1;

if (next) {

    showSlider(sliderIndex);

    function showSlider(n) {
        if (n < 1) {
            sliderIndex = slider.length;
        } else if (n > slider.length) {
            sliderIndex = 1;
        }
        for (let i = 0; i < slider.length; i++) {
            slider[i].style.display = 'none';
        }
        slider[sliderIndex - 1].style.display = 'block';
    }

    function plusSlider(n) {
        showSlider(sliderIndex += n)
    }

    next.onclick = function () {
        plusSlider(1);
    }

    prev.onclick = function () {
        plusSlider(-1);
    }
}



