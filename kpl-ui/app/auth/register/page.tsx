"use client";

import Link from "next/link";
import { Card, Alert } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const demoAccounts = [
  { email: "admin@kpl.com", password: "admin123", role: "admin", name: "Admin User" },
  { email: "user@kpl.com", password: "user123", role: "user", name: "Test User" },
  { email: "demo@kpl.com", password: "demo123", role: "user", name: "Demo User" },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md" style={{ backgroundColor: "#1f2937" }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Demo Accounts</h1>
          <p className="text-gray-400 mt-2">Use these accounts to login</p>
        </div>

        <Alert
          message="Registration Disabled"
          description="Registration is currently disabled. Please use one of the demo accounts below."
          type="info"
          className="mb-4"
        />

        <div className="space-y-4">
          {demoAccounts.map((account, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded-lg border border-gray-600"
            >
              <div className="flex items-center gap-2 mb-2">
                <UserOutlined className="text-blue-400" />
                <span className="text-white font-semibold">{account.name}</span>
                <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  {account.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                <MailOutlined />
                <code className="bg-gray-800 px-2 py-1 rounded">{account.email}</code>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <LockOutlined />
                <code className="bg-gray-800 px-2 py-1 rounded">{account.password}</code>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 text-lg">
            Go to Login →
          </Link>
        </div>
      </Card>
    </div>
  );
}
