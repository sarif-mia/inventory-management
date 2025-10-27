import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import inventoryReducer from './slices/inventorySlice';
import warehouseReducer from './slices/warehouseSlice';
import sellerReducer from './slices/sellerSlice';
import shippingReducer from './slices/shippingSlice';
import paymentReducer from './slices/paymentSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import quickCommerceReducer from './slices/quickCommerceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
    inventory: inventoryReducer,
    warehouse: warehouseReducer,
    sellers: sellerReducer,
    shipping: shippingReducer,
    payments: paymentReducer,
    marketplace: marketplaceReducer,
    quickCommerce: quickCommerceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;