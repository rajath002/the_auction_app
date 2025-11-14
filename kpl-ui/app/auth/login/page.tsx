"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Alert, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import SplashBackground from "@/components/SplashBackground";
import { useAppContext } from "@/context/useAppState";

export default function LoginPage() {
  const router = useRouter();
  const { initDataValues } = useAppContext();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        await initDataValues();
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SplashBackground />
      <Card className="w-full max-w-md" style={{ backgroundColor: "#1f2937" }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Login</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {/* <Alert
          message="Demo Accounts Available"
          description={
            <div>
              <p className="mb-2">Click &quot;Register&quot; to see available demo accounts.</p>
              <p className="text-xs">Quick login: admin@kpl.com / admin123</p>
            </div>
          }
          type="info"
          className="mb-4"
        /> */}

        {error && (
          <Alert
            message={error}
            type="error"
            closable
            onClose={() => setError("")}
            className="mb-4"
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              type="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {process.env.NODE_ENV === 'development' && (
          <div className="text-center mt-4">
            <span className="text-gray-400">Don&apos;t have an account? </span>
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300">
              View demo accounts
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
