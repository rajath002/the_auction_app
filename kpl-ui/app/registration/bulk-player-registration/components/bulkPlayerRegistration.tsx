"use client";

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Card,
  Space,
  Row,
  Col,
  Spin,
  Upload,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import SubmitButton from "@/app/components/SubmitButton";

interface SubmissionFormType {
  onFinish: (e: React.FormEvent<HTMLFormElement>) => void;
  disableForm: boolean;
}

export default function BulkPlayerRegistrationForm() {
  const [fileList, setFileList] = useState<any[]>([]);

  const onSubmit = useCallback((e: any) => {
    console.log("onSubmit", e);
    // props.onFinish({
    //   ...e,
    //   uploadedFile: fileList[0]
    // });
  }, [fileList])

  // Handle file change (AntD Upload component)
  const handleFileChange = useCallback((param) => {
    setFileList(param.fileList);
  }, [setFileList]);

  return (
    <Row gutter={16} align={"middle"} justify={"center"}>
      <Col>
        <Card style={{ width: 800 }} title="Please enter below details">
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            style={{ maxWidth: 600 }}
            onFinish={onSubmit}
            // disabled={props.disableForm}
          >

            {/* Upload image */}
            <Form.Item label="Upload" valuePropName="fileList">
              <Upload fileList={fileList} listType="picture-card" maxCount={1} onChange={handleFileChange}>
                <button style={{ border: 0, background: 'none' }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
            </Form.Item>
            <Space>
              <Form.Item>
                <SubmitButton disableForm={false} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="default"
                  className="login-form-button"
                  htmlType="reset"
                  onClick={() => setFileList([])}
                >
                  Reset
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
