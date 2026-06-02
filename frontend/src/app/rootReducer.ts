import { combineReducers } from '@reduxjs/toolkit';

// Placeholder Auth State Slice
interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; name: string; role: string };
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authReducer = (
  state = initialAuthState,
  action: { type: string; payload?: { id: string; name: string; role: string } },
): AuthState => {
  switch (action.type) {
    case 'auth/login':
      return { isAuthenticated: true, user: action.payload || null };
    case 'auth/logout':
      return { isAuthenticated: false, user: null };
    default:
      return state;
  }
};

export const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
