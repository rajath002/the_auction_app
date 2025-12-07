import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/models";
import { connectDB } from "@/lib/sequelize";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {

          console.log("Authorizing user with credentials:", credentials);
          // Ensure database connection is established
          await connectDB();

          // Validate input
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Sanitize email input
          const email = credentials.email.toLowerCase().trim();

          // Find user in database
          const user = await User.findOne({
            where: { email },
          });

          if (!user) {
            // Generic error message to prevent user enumeration
            throw new Error("Invalid email or password | User Not Found");
          }

          // Verify password using bcrypt
          const isValidPassword = await user.validatePassword(credentials.password);

          if (!isValidPassword) {
            // Generic error message to prevent user enumeration
            throw new Error("Invalid email or password | Invalid Password");
          }

          // Update last login timestamp
          await user.update({ last_login: new Date() });

          // Return user data for session (excluding sensitive data)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          // Re-throw the error for NextAuth to handle
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      
      // Optional: Handle token refresh
      if (trigger === "update") {
        // You can update the token here if needed
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home page after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
