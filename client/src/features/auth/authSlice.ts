import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  virtualBalance: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    updateAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateAccessToken, updateUser } =
  authSlice.actions;
export const authReducer = authSlice.reducer;