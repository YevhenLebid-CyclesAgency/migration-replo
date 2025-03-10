const selectors = {
  overlay: '.quick-add-drawer__overlay',
  closeDrawerButton: '[data-close-get-somnifix-drawer]',
  openDrawerButton: '[data-open-get-somnifix-drawer]',
};

const classes = {
  open: 'is-open',
  overflowHidden: 'overflow-hidden',
};

class QuickAddDrawer extends HTMLElement {
  constructor() {
    super();

    this.overlay = this.querySelector(selectors.overlay);
    this.closeDrawerButton = this.querySelector(selectors.closeDrawerButton);
    this.openDrawerButtons = document.querySelectorAll(selectors.openDrawerButton);

    this.quantityWrapper = this.querySelector('.quick-add-drawer__quantity');
    this.quantityInput = this.querySelector('#QuickAddDrawer-QuantityInput');

    this.quantityDecreaseButton = this.querySelector('.qty__button.qty__button--minus');
    this.quantityIncreaseButton = this.querySelector('.qty__button.qty__button--plus');


    this.subscriptionCheckbox = this.querySelector('.quick-add-drawer__subscription input[type="checkbox"]');

    this.addToCartButton = this.querySelector('.quick-add-drawer__add-to-cart button');

    this.init();
  }

  init() {
    this.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        if (this.classList.contains(classes.open)) {
          this.classList.remove(classes.open);
        }

        if (document.body.classList.contains(classes.overflowHidden)) {
          document.body.classList.remove(classes.overflowHidden);
        }
      }
    });

    this.openDrawerButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.classList.toggle(classes.open, true);
        document.body.classList.toggle(classes.overflowHidden, true);
      });
    });

    this.closeDrawerButton.addEventListener('click', () => {
      this.classList.toggle(classes.open, false);
      document.body.classList.toggle(classes.overflowHidden, false);
    });

    this.quantityIncreaseButton.addEventListener('click', () => {
      this.quantityInput.stepUp();

      this.querySelector('.quick-add-drawer__total .regular-price-total').textContent = '$' + this.quantityInput.value * this.querySelector('.product-variant__swatch.active').dataset.price;
    });

    this.quantityDecreaseButton.addEventListener('click', () => {
      if(this.quantityInput.min) {
        const min = parseInt(this.quantityInput.min, 10);
        this.quantityDecreaseButton?.classList?.toggle('disabled', this.quantityInput.value <= min);
        if (this.quantityInput.value < min) {
          this.quantityInput.value = min;
        }
      }
      this.quantityInput.stepDown();

      this.querySelector('.quick-add-drawer__total .regular-price-total').textContent = '$' + this.quantityInput.value * this.querySelector('.product-variant__swatch.active').dataset.price;
    });

    this.subscriptionCheckbox.addEventListener('change', () => {
      let swatch = this.querySelector('.product-variant__swatch.active');
      if (this.subscriptionCheckbox.checked) {
        this.quantityIncreaseButton.setAttribute('disabled', 'disabled');
        this.quantityDecreaseButton.setAttribute('disabled', 'disabled');
        let priceSubscribe = swatch.dataset.price - (swatch.dataset.price * 10 / 100);

        this.querySelector('.quick-add-drawer__total .regular-price-total').textContent = '$' + priceSubscribe.toFixed(2);
        this.quantityInput.value = 1;
      }
      else {
        this.quantityIncreaseButton.removeAttribute('disabled');
        this.quantityDecreaseButton.removeAttribute('disabled');

        this.querySelector('.quick-add-drawer__total .regular-price-total').textContent = '$' + swatch.dataset.price;
        this.quantityInput.value = 1;
      }
    });

    this.querySelectorAll('.product-variant__swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        this.querySelectorAll('.product-variant__swatch').forEach((swatch) => {
          swatch.classList.remove('active');
        });

        this.subscriptionCheckbox.checked = false;
        this.subscriptionCheckbox.dispatchEvent(new Event('change'));
        swatch.classList.add('active');

        // change number of products under QTY
        this.querySelector('.quick-add-drawer__special-note span').textContent = swatch.dataset.strips + ' Strips = ' + parseInt(swatch.dataset.strips) / 7 + ' Weeks';

        // change price
        this.querySelector('.quick-add-drawer__total .regular-price-total').textContent = '$' + swatch.dataset.price * this.quantityInput.value;
        if (swatch.dataset.compare) {
          this.querySelector('.quick-add-drawer__total .compare-price').textContent = swatch.dataset.compare;
        }
        else {
          this.querySelector('.quick-add-drawer__total .compare-price').textContent = '';
        }

        if (swatch.dataset.planid) {
          this.querySelector('.quick-add-drawer__subscription').classList.remove('hidden');
          let priceSubscribe = swatch.dataset.price - (swatch.dataset.price * 10 / 100);
          this.querySelector('.subscription__info').innerHTML = `
            Auto delivery every ${swatch.dataset.months} for $${priceSubscribe.toFixed(2)}. <br>No hidden fees. Сancel anytime.
          `;
        }
        else {
          this.querySelector('.quick-add-drawer__subscription').classList.add('hidden');
        }
      });
    });

    this.addToCartButton.addEventListener('click', () => {
      let swatch = this.querySelector('.product-variant__swatch.active');
      let checkbox = this.subscriptionCheckbox.checked;
      let quantity = this.quantityInput.value;
      let id = swatch.dataset.variant;
      let selling_plan = swatch.dataset.planid;

      let data;

      if (checkbox) {
        console.log('checkbox true');
        console.log('id', id);
        console.log('quantity', quantity);
        console.log('selling_plan', selling_plan);
        data = {
          id,
          quantity,
          selling_plan,
        };
      } else {
        console.log('checkbox false');
        console.log('id', id);
        console.log('quantity', quantity);
        data = {
          id,
          quantity,
        };
      }
      

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          window.location.href = '/cart';
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  }
}

customElements.get('quick-add-drawer') || customElements.define('quick-add-drawer', QuickAddDrawer);