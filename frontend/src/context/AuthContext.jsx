import { jwtDecode } from "jwt-decode";
import { createContext, useReducer } from "react";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  role: null,
  isAuthenticated: false,
};

if (initialState.token) {
  try {
    const decodedToken = jwtDecode(initialState.token);

    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      initialState.token = null;
    } else {
      initialState.user = { id: decodedToken.id };
      initialState.role = decodedToken.role;
      initialState.isAuthenticated = true;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    initialState.token = null;
  }
}

export const AuthContext = createContext(initialState);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      const decoded = jwtDecode(action.payload.token);
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        user: { id: decoded.id },
        token: action.payload.token,
        role: decoded.role,
        isAuthenticated: true,
      };
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
      };
    case "AUTH_ERROR":
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
