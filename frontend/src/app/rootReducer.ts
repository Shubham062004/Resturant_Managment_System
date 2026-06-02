import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import customerReducer from '../features/customer/store/customerSlice';
import restaurantReducer from '../features/customer/store/restaurantSlice';
import favoriteReducer from '../features/customer/store/favoriteSlice';
import searchReducer from '../features/customer/store/searchSlice';
import orderReducer from '../features/orders/store/orderSlice';
import trackingReducer from '../features/orders/store/trackingSlice';
import refundReducer from '../features/orders/store/refundSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  restaurant: restaurantReducer,
  favorite: favoriteReducer,
  search: searchReducer,
  orders: orderReducer,
  tracking: trackingReducer,
  refunds: refundReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
