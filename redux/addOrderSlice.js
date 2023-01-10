import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appetizers: [],
  cart: [],
};

const addOrderSlice = createSlice({
  name: "addOrder",
  initialState: initialState,
  reducers: {
    addToAppetizer: (state = initialState, action) => {
      const itemInAppetizer = state.appetizers.find(
        (item) =>
          item.id === action.payload.id &&
          item.serving === action.payload.serving
      );
      if (itemInAppetizer) {
        itemInAppetizer.quantity++;
      } else {
        state.appetizers.push({
          ...action.payload,
          quantity: 1,
          addition: null,
        });
      }
    },
    addToCart: (state, action) => {
      const itemInCart = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (itemInCart) {
        itemInCart.quantity++;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    incrementAppetizer: (state, action) => {
      const itemInAppetizer = state.appetizers.find(
        (item) =>
          item.id === action.payload.id &&
          item.serving === action.payload.serving
      );
      itemInAppetizer.quantity++;
    },
    incrementCart: (state, action) => {
      const itemInCart = state.cart.find(
        (item) => item.id === action.payload.id
      );
      itemInCart.quantity++;
    },
    decrementAppetizer: (state, action) => {
      const itemInAppetizer = state.appetizers.find(
        (item) =>
          item.id === action.payload.id &&
          item.serving === action.payload.serving
      );
      if (itemInAppetizer.quantity === 1) {
        itemInAppetizer.quantity = 1;
      } else {
        itemInAppetizer.quantity -= 1;
      }
    },
    decrementCart: (state, action) => {
      const itemInCart = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (itemInCart.quantity === 1) {
        itemInCart.quantity = 1;
      } else {
        itemInCart.quantity -= 1;
      }
    },
    removeAppetizer: (state, action) => {
      const itemInAppetizer = state.appetizers.filter(
        (item) =>
          item.id !== action.payload.id &&
          item.serving === action.payload.serving
      );
      state.appetizers = itemInAppetizer;
    },
    removeCart: (state, action) => {
      const itemInCart = state.cart.filter(
        (item) => item.id !== action.payload.id
      );
      state.cart = itemInCart;
    },
    restartAppetizer: (state, action) => {
      state.appetizers = [];
    },
    restartCart: (state, action) => {
      state.cart = [];
    },
    addAddition: (state, action) => {
      const itemInAppetizer = state.appetizers.find(
        (item) =>
          item.id === action.payload.id &&
          item.serving === action.payload.serving
      );
      itemInAppetizer.addition = action.payload.addition;
    },
  },
});

export const appetizerReducer = addOrderSlice.reducer;
export const {
  removeAppetizer,
  incrementAppetizer,
  decrementAppetizer,
  addToAppetizer,
  restartAppetizer,
  removeCart,
  incrementCart,
  decrementCart,
  addToCart,
  restartCart,
  addAddition,
} = addOrderSlice.actions;
