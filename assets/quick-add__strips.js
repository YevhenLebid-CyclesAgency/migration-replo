class ProductSelect extends HTMLElement {
  constructor() {
    super();
    // this.attachShadow({ mode: 'open' });

    // Adding HTML structure
    // this.shadowRoot.innerHTML = `
    //   <style>
    //     /* Add your styles here */
    //   </style>
    //   <div id="product_select">
    //     <slot></slot>
    //     <div class="loader_custom"></div>
    //   </div>
    // `;
  }

  connectedCallback() {
    this.initListeners();
  }

  initListeners() {
    const productSelect = this;
    const packs = productSelect.querySelectorAll('.pack');
    const mainButton = productSelect.querySelector('.btn_main');
    const checkbox = productSelect.querySelector('input[type="checkbox"]');
    const subscriptionInfo = productSelect.querySelector('.subscription');
    const totalOld = productSelect.querySelector('.total_old');
    const totalNew = productSelect.querySelector('.total_new');

    packs.forEach((pack) => {
      pack.addEventListener('click', () => {
        // if (pack.classList.contains('active')) {
        //   mainButton.click();
        //   return;
        // }
        this.clearActivePack(packs);
        pack.classList.add('active');

        const variant = pack.dataset.id;
        const plan = pack.dataset.planid;
        const pricePlan = pack.dataset.pp;
        const month = pack.querySelector('.size')?.textContent;
        const price = pack.querySelector('.current')?.textContent;
        const oldPrice = pack.querySelector('.old')?.textContent;

        if (!plan) {
          subscriptionInfo.style.display = 'none';
        } else {
          subscriptionInfo.style.display = 'flex';
          subscriptionInfo.querySelector('span.frequency').textContent = month;
          subscriptionInfo.querySelector('span.plan--price').textContent = pricePlan;
          checkbox.checked = false;
        }

        if (!oldPrice) {
          totalOld.style.display = 'none';
        } else {
          totalOld.style.display = 'inline';
          totalOld.textContent = oldPrice;
        }

        totalNew.textContent = price;

        mainButton.dataset.variant = variant;
        mainButton.dataset.plan = plan;
      });
    });

    checkbox.addEventListener('change', () => {
      const activePack = productSelect.querySelector('.pack.active');
      if (checkbox.checked) {
        const price = activePack.dataset.pp;
        totalNew.textContent = price;
      } else {
        const price = activePack.querySelector('.current').textContent;
        totalNew.textContent = price;
      }
    });

    mainButton.addEventListener('click', async () => {
      const subscribe = checkbox.checked;
      const variant = mainButton.dataset.variant;
      const planId = mainButton.dataset.plan;
      const productId = mainButton.dataset.product;

      await this.buyProductHomePage(variant, planId, productId, subscribe);
    });
  }

  clearActivePack(packs) {
    packs.forEach((pack) => pack.classList.remove('active'));
  }

  async buyProductHomePage(itemId, planId, productId, subscribe) {
    try {
      const itemQuantity = 1;
      const formData = {
        items: [
          {
            id: itemId,
            quantity: itemQuantity,
            ...(subscribe && { selling_plan: planId }),
          },
        ],
      };

      const cart = await fetch('/cart.js').then((res) => res.json());
      const alreadyInCart = subscribe
        ? cart.items.some((item) => item.selling_plan_allocation?.selling_plan?.id === planId)
        : false;

      if (!alreadyInCart) {
        await this.addToCart(formData);
      }

      window.location.href = '/cart';
    } catch (error) {
      console.error(error);
    }
  }

  async addToCart(formData) {
    return await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  }
}

customElements.define('product-select', ProductSelect);