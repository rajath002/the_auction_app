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
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface SubmissionFormType {
  onFinish: (e: React.FormEvent<HTMLFormElement>) => void;
  disableForm: boolean;
}

export default function RegistrationForm(props: SubmissionFormType) {
  return (
    <Row gutter={16} align={"middle"} justify={"center"}>
      <Col>
        <Card style={{ width: 800 }} title="Please enter below details">
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            style={{ maxWidth: 600 }}
            onFinish={props.onFinish}
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
            <Space>
              <Form.Item>
                <SubmitButton disableForm={props.disableForm} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="default"
                  className="login-form-button"
                  htmlType="reset"
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

function SubmitButton(props: { disableForm: boolean }) {
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
