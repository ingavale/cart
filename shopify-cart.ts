import {CartInterface} from "./lib/cart-interface";
import {
  Attributes, CartEvents,
  CartItemRemove,
  CartItems,
  CartItemsResponse, CartItemUpdate,
  CartLineItem, CartRoute,
  CartSettings,
  CartState, ShopifyResponse
} from "./lib/types";
import {InventoryError, VariantError} from "./lib/errors";

export class ShopifyCart implements CartInterface {
  private _state: CartState;
  private readonly _settings: CartSettings = {
    url: '',
    postConfig: {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;',
      },
    },
    updateState: true,
  };

  constructor(settings: CartSettings) {
    this._settings = { ...this._settings, ...settings };
    this.cartEvent('cart:ready');
  }

  get state(): CartState {
    return this._state;
  }

  get settings(): CartSettings {
    return this._settings;
  }

  public async getState(): Promise<CartState> {
    this.cartEvent('cart:requestStarted', '/cart.js');
    const response = await fetch(`${this._settings.url}/cart.js`);
    this._state = await response.json();
    this.cartEvent('cart:requestComplete', '/cart.js');
    return this._state;
  }

  public async addItem(items: CartItems): Promise<CartItemsResponse> {
    const data = Array.isArray(items) ? items : [items];
    const response = await this.post('/cart/add.js', JSON.stringify({ items: data }));
    if (this._settings.updateState) {
      await this.getState();
    }
    return response as CartItemsResponse;
  }

  public async addItemFromForm(productForm: HTMLFormElement): Promise<CartLineItem> {
    const formData = new FormData(productForm);
    if (!formData.get('id')) {
      throw 'Cart form missing required property ID';
    }
    const formJson = JSON.stringify(Object.fromEntries(formData.entries()));
    const response = await this.post('/cart/add.js', formJson);
    if (this._settings.updateState) {
      await this.getState();
    }
    return response as CartLineItem;
  }

  public async clearAttributes(): Promise<CartState> {
    const state = await this.getState();
    const data = JSON.stringify({
      attributes: this.clearProps(state.attributes),
    });
    return await this.post('/cart/update.js', data);
  }

  public async clearItems(): Promise<CartState> {
    return await this.post('/cart/clear.js');
  }
  public async clearNote(): Promise<CartState> {
    return await this.post('/cart/update.js', JSON.stringify({ note: '' }));
  }
  public async removeItem(item: CartItemRemove): Promise<CartState> {
    return await this.post('/cart/change.js', JSON.stringify({ quantity: 0, ...item }));
  }

  public async updateAttributes(attributes: Attributes): Promise<CartState> {
    return await this.post('/cart/update.js', JSON.stringify({ attributes: { ...attributes } }));
  }

  public async updateItem(item: CartItemUpdate): Promise<CartState> {
    return await this.post('/cart/change.js', JSON.stringify(item));
  }

  public async updateNote(note: string): Promise<CartState> {
    return await this.post('/cart/update.js', JSON.stringify({ note: note }));
  }

  protected async post<Return>(route: CartRoute, data?: BodyInit): Promise<Return> {
    const url = this._settings.url + route;
    const postConfig = this._settings.postConfig;
    if (data) {
      postConfig.body = data;
    }
    this.cartEvent('cart:requestStarted', route);
    const request = await fetch(url, postConfig);
    const response = await request.json();
    this.checkResponse(response);
    this.cartEvent('cart:requestComplete', route);
    return response;
  }

  protected checkResponse(response: ShopifyResponse): void {
    if (response['status'] === 404) {
      throw new VariantError();
    }
    if (response['status'] === 422) {
      throw new InventoryError(response['description']);
    }
    if (response['token']) {
      this._state = response as CartState;
    }
  }

  protected clearProps(target: Record<string, unknown>): { [key: string]: '' } {
    const clearList = {};
    Object.getOwnPropertyNames(target).forEach((prop) => (clearList[prop] = ''));
    return clearList;
  }

  protected cartEvent(name: CartEvents, route?: CartRoute): void {
    document.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          cart: this,
          route: route,
        },
        bubbles: true,
        cancelable: true,
        composed: false,
      })
    );
  }
}
