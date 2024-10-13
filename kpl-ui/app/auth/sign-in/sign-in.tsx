"use client";
import { FC, Ref, useCallback, useEffect, useRef, useState } from "react";
import { User } from "firebase/auth";
import {
  Button,
  Form,
  FormInstance,
  Input,
  message,
  Radio,
  Row,
  Typography,
} from "antd";
import { signIn, signUp } from "@/services/auth";
import Link from "next/link";

const { Text, Title } = Typography;

const SigninComponent: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const formRef = useRef<FormInstance>();

  const onSignin = useCallback(async () => {
    try {
      const payload = formRef.current?.getFieldsValue();
      let result;
      setLoading(true);
      if (isSignUp) {
        result = await signUp(payload);
        messageApi.success("Sign Up Successful");
      } else {
        result = await signIn(payload);
        messageApi.success("Sign In Successful");
      }

      console.log("Token:", result);
      setUser(user);
    } catch (error) {
      console.error("Error during sign in:", error);
    } finally {
      setLoading(false);
    }
  }, [isSignUp, messageApi, user]);

  const setDummyUser = useCallback(() => {
    formRef.current?.setFieldsValue({
      password: "123456",
      confirmPassword: "123456",
      userName: "Abc Test",
      gender: "m",
      phone: "1234567890",
    });
  }, []);

  const changeForm = useCallback(() => {
    formRef.current?.resetFields();
    setIsSignUp(!isSignUp);
  }, [isSignUp]);

  return (
    <>
    {contextHolder}
      <Title>{isSignUp ? "Sign Up" : "Sign In"}</Title>
      {/* Create a form, accept email and password  */}
      <Form
        ref={formRef as any}
        name="Signin"
        onFinish={onSignin}
        layout="vertical"
      >
        {/* Show below items only when the user is Signing up! */}
        {isSignUp && (
          <>
            <Form.Item
              label="Username"
              name="userName"
              rules={[
                { required: true, message: "Please enter your User name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[
                { required: true, message: "Please select your gender!" },
              ]}
            >
              <Radio.Group>
                <Radio value="m">Male</Radio>
                <Radio value="f">Female</Radio>
                <Radio value="o">Other</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: "Please Enter Phone Number!" },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        )}
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please enter your Email Id!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="password"
          name="password"
          rules={[{ required: true, message: "Please enter your Password!" }]}
        >
          <Input.Password />
        </Form.Item>

        {/* Show below item only when the user is Signing up! */}
        {isSignUp && (
          <Form.Item
            label="confirm Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please Re-enter your Password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}

        {/* create a submit and reset button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <Button
            htmlType="button"
            onClick={() => formRef.current?.resetFields()}
          >
            Reset
          </Button>
          <Button htmlType="button" onClick={setDummyUser}>
            Set Dummy User
          </Button>
        </Form.Item>

        {/* ask to signup if not registered */}
        <Row>
          <Text className="flex items-center text-lg">
            {isSignUp ? (
              <>
                Already Registered, OK! Let&apos;s &nbsp;
                <Link href="#" onClick={changeForm}>
                  Sign In!
                </Link>
              </>
            ) : (
              <>
                Not Registered, OK! Let&apos;s &nbsp;
                <Link href="#" onClick={changeForm}>
                  Sign Up!
                </Link>
              </>
            )}
          </Text>
        </Row>
      </Form>
      {user && JSON.stringify(user)}
    </>
  );
};

export default SigninComponent;
