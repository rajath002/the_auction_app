import axios from "axios";

// sign up service
export const signUp = async (payload: { email: string; password: string }) => {
  const response = await axios.post("/api/auth/signup", payload);
  return response.data;
};

// sign in service
export const signIn = async (p0: string, payload: { email: string; password: string; }) => {
  const response = await axios.post("/api/auth/signin", payload);

  console.log("Response:", response.data);
  return response.data;
};
