import { combineReducers } from '@reduxjs/toolkit';

import adminReducer from '../features/admin/store/adminSlice';
import staffReducer from '../features/admin/store/staffSlice';
import aiReducer from '../features/ai/store/aiSlice';
import assistantReducer from '../features/ai/store/assistantSlice';
import forecastReducer from '../features/ai/store/forecastSlice';
import recommendationReducer from '../features/ai/store/recommendationSlice';
import analyticsReducer from '../features/analytics/store/analyticsSlice';
import authReducer from '../features/auth/store/authSlice';
import customerReducer from '../features/customer/store/customerSlice';
import favoriteReducer from '../features/customer/store/favoriteSlice';
import restaurantReducer from '../features/customer/store/restaurantSlice';
import searchReducer from '../features/customer/store/searchSlice';
import deliveryReducer from '../features/delivery/store/deliverySlice';
import tableReducer from '../features/floor-plan/store/tableSlice';
import inventoryReducer from '../features/inventory/store/inventorySlice';
import kitchenReducer from '../features/kitchen/store/kitchenSlice';
import stationReducer from '../features/kitchen/store/stationSlice';
import menuReducer from '../features/menu/store/menuSlice';
import notificationReducer from '../features/notifications/store/notificationSlice';
import orderReducer from '../features/orders/store/orderSlice';
import refundReducer from '../features/orders/store/refundSlice';
import trackingReducer from '../features/orders/store/trackingSlice';
import posReducer from '../features/pos/store/posSlice';
import qaReducer from '../features/qa/store/qaSlice';
import reservationReducer from '../features/reservations/store/reservationSlice';
import organizationReducer from '../features/super-admin/store/organizationSlice';
import platformReducer from '../features/super-admin/store/platformSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  restaurant: restaurantReducer,
  favorite: favoriteReducer,
  search: searchReducer,
  menu: menuReducer,
  orders: orderReducer,
  tracking: trackingReducer,
  refunds: refundReducer,
  kitchen: kitchenReducer,
  stations: stationReducer,
  delivery: deliveryReducer,
  inventory: inventoryReducer,
  pos: posReducer,
  reservations: reservationReducer,
  tables: tableReducer,
  admin: adminReducer,
  analytics: analyticsReducer,
  staff: staffReducer,
  organizations: organizationReducer,
  platform: platformReducer,
  notifications: notificationReducer,
  ai: aiReducer,
  recommendation: recommendationReducer,
  assistant: assistantReducer,
  forecast: forecastReducer,
  qa: qaReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
