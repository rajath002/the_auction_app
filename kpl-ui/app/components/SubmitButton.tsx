"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";

export default function SubmitButton(props: { disableForm: boolean }) {
    return (
      <Button type="primary" className="bg-blue-700" htmlType="submit">
        {props.disableForm ? (
          <>
            Loading...
            <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
          </>
        ) : (
          "Submit"
        )}
      </Button>
    );
  }