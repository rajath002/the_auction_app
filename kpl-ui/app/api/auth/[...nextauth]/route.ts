import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signIn, logOut } from "../util";
// import { signOut  } from "firebase/auth";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {

        console.log("Credentials--------------> ", credentials);
        if (!credentials) return null;

        try {
          // Sign in with Firebase
          const userCredential = await signIn(
            credentials.email,
            credentials.password
          );

          // console.log("User Credential--------------> ", userCredential);
          // const token = await userCredential.user.getIdToken();
          // const decodedToken = await admin.auth().verifyIdToken(token);

          if (userCredential.user) {
            return {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              idToken: await userCredential.user.getIdToken(),
              refreshToken: userCredential.user.refreshToken,
            };
          }

          // idToken comes from the client app

          return null;
        } catch (error) {
          console.error("Error during authentication", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT--------------> HERE : ", token);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = (user as any).token; // Add the token to the JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        (session.user as any).accessToken = token.accessToken as string; // Include the token in the session
      }
      return session;
    },
    async redirect({  baseUrl }) {
      // Redirect to the home page after successful login
      console.log("Redirect--------------> ", baseUrl);
      return baseUrl; // This will redirect to "/"
    },
  },
  // pages: {
  //   signIn: "/auth/signin",
  // },
  events: {
    async signOut({ token }) {
      // Perform backend logic here when the user signs out
      // For example, you could log the sign-out, clear user data, or update the database.
      console.log(`User with ID ${token?.id} has signed out.`);

      // Example backend logic:
      try {
        // Perform a backend operation here, such as updating the user's status in the database
        
        await logOut();
        console.log("User status updated to offline.");
      } catch (error) {
        console.error("Error updating user status on sign out:", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// explictely export GET and POST handlers
export const GET = handler;
export const POST = handler;