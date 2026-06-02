import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import customerReducer from '../features/customer/store/customerSlice';
import restaurantReducer from '../features/customer/store/restaurantSlice';
import favoriteReducer from '../features/customer/store/favoriteSlice';
import searchReducer from '../features/customer/store/searchSlice';
import orderReducer from '../features/orders/store/orderSlice';
import trackingReducer from '../features/orders/store/trackingSlice';
import refundReducer from '../features/orders/store/refundSlice';
import kitchenReducer from '../features/kitchen/store/kitchenSlice';
import stationReducer from '../features/kitchen/store/stationSlice';
import deliveryReducer from '../features/delivery/store/deliverySlice';
import inventoryReducer from '../features/inventory/store/inventorySlice';
import posReducer from '../features/pos/store/posSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  restaurant: restaurantReducer,
  favorite: favoriteReducer,
  search: searchReducer,
  checkout: checkoutReducer,
  orders: orderReducer,
  tracking: trackingReducer,
  refunds: refundReducer,
  kitchen: kitchenReducer,
  stations: stationReducer,
  delivery: deliveryReducer,
  inventory: inventoryReducer,
  pos: posReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
