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

export default function RegistrationForm(props: SubmissionFormType) {
  const [fileList, setFileList] = useState<any[]>([]);

  const onSubmit = useCallback((e: any) => {
    console.log("onSubmit", e);
    props.onFinish({
      ...e,
      uploadedFile: fileList[0]
    });
  }, [fileList, props])

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
            disabled={props.disableForm}
          >

            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
              <Input placeholder="Enter your name" />
            </Form.Item>
            <Form.Item label="Level" name="level">
              <Select placeholder="Select the Level">
                <Select.Option value="L1">L1</Select.Option>
                <Select.Option value="L2">L2</Select.Option>
                <Select.Option value="L3">L3</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Date Of Birth" name="dateOfBirth" rules={[{ required: true, message: 'Please select your date of birth' }]}>
              <DatePicker placeholder="Select Date Of Birth" />
            </Form.Item>
            <Form.Item label="Contact No " name="contactNo" rules={[{ required: true, message: 'Please enter your contact number' }]}>
              <InputNumber
                maxLength={10}
                addonBefore="+91"
                placeholder="Enter your contact number"
                className="w-100"
              />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
              <Input type="email" placeholder="Enter your email" />
            </Form.Item>
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
                <SubmitButton disableForm={props.disableForm} />
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
