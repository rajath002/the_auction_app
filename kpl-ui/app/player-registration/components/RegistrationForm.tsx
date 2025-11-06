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
    <Row align={"middle"} justify={"center"} className="min-h-screen py-8">
      <Col xs={22} sm={20} md={16} lg={12} xl={10}>
        <Card 
          title="Player Registration" 
          className="shadow-lg"
          headStyle={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            textAlign: 'center' 
          }}
        >
          <Form
            layout="vertical"
            onFinish={props.onFinish}
            disabled={props.disableForm}
            requiredMark="optional"
          >
            <Form.Item 
              label="Name" 
              name="name" 
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input 
                placeholder="Enter your name" 
                size="large"
              />
            </Form.Item>

            <Form.Item 
              label="Level" 
              name="level"
              rules={[{ required: true, message: 'Please select your level' }]}
            >
              <Select 
                placeholder="Select the Level" 
                size="large"
              >
                <Select.Option value="L1">L1</Select.Option>
                <Select.Option value="L2">L2</Select.Option>
                <Select.Option value="L3">L3</Select.Option>
                <Select.Option value="L4">L4</Select.Option>
                <Select.Option value="L5">L5</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item 
              label="Date Of Birth" 
              name="dateOfBirth" 
              rules={[{ required: true, message: 'Please select your date of birth' }]}
            >
              <DatePicker 
                placeholder="Select Date Of Birth" 
                size="large"
                className="w-full"
                format="DD-MMM-YYYY"
              />
            </Form.Item>

            <Form.Item 
              label="Contact Number" 
              name="contactNo" 
              rules={[
                { required: true, message: 'Please enter your contact number' },
                { 
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const valueStr = value.toString();
                    if (valueStr.length === 10) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Contact number must be 10 digits'));
                  }
                }
              ]}
            >
              <InputNumber
                maxLength={10}
                addonBefore="+91"
                placeholder="Enter your contact number"
                size="large"
                className="w-full"
                controls={false}
              />
            </Form.Item>

            <Form.Item 
              label="Email" 
              name="email" 
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                type="email" 
                placeholder="Enter your email" 
                size="large"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space size="middle" className="w-full justify-center">
                <SubmitButton disableForm={props.disableForm} />
                <Button
                  type="default"
                  htmlType="reset"
                  size="large"
                >
                  Reset
                </Button>
              </Space>
            </Form.Item>
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
