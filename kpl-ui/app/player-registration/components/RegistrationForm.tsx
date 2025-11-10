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
  message,
} from "antd";
import { LoadingOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile, UploadProps } from "antd";

interface SubmissionFormType {
  onFinish: (values: any) => void;
  disableForm: boolean;
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

export default function RegistrationForm(props: SubmissionFormType) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleBeforeUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.');
      return Upload.LIST_IGNORE;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error('File size exceeds 5MB limit');
      return Upload.LIST_IGNORE;
    }

    // Store the file for later upload
    setSelectedFile(file);
    return false; // Prevent automatic upload
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setFileList([]);
    props.setImageUrl('');
  };

  const uploadImageToImageKit = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/imagekit', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  };

  const handleFormSubmit = async (values: any) => {
    // If there's a selected file, upload it first
    if (selectedFile) {
      setUploading(true);
      message.loading({ content: 'Uploading image...', key: 'imageUpload', duration: 0 });

      try {
        const imageUrl = await uploadImageToImageKit(selectedFile);
        message.success({ content: 'Image uploaded successfully', key: 'imageUpload', duration: 2 });
        props.setImageUrl(imageUrl);
        
        // Call the parent's onFinish with updated values
        props.onFinish(values);
      } catch (error) {
        message.error({ content: 'Failed to upload image', key: 'imageUpload', duration: 3 });
        console.error('Upload error:', error);
        setUploading(false);
        return; // Don't submit form if image upload fails
      } finally {
        setUploading(false);
      }
    } else {
      // No image selected, just submit the form
      props.onFinish(values);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload Image</div>
    </button>
  );
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
            onFinish={handleFormSubmit}
            disabled={props.disableForm || uploading}
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
              label="Player Image" 
              name="image"
              rules={[{ required: false, message: 'Please upload a player image' }]}
              extra="Upload a profile picture (Max 5MB, JPG/PNG/WebP). Image will be uploaded when you submit the form."
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={handleBeforeUpload}
                onChange={handleChange}
                onRemove={handleRemove}
                maxCount={1}
                accept="image/jpeg,image/jpg,image/png,image/webp"
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </Form.Item>

            <Form.Item 
              label="Type" 
              name="type"
              rules={[{ required: true, message: 'Please select player type' }]}
            >
              <Select 
                placeholder="Select player type" 
                size="large"
              >
                <Select.Option value="Batsman">Batsman</Select.Option>
                <Select.Option value="Bowler">Bowler</Select.Option>
                <Select.Option value="All-Rounder">All-Rounder</Select.Option>
                <Select.Option value="Wicket-Keeper">Wicket-Keeper</Select.Option>
              </Select>
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
              </Select>
            </Form.Item>

            <Form.Item 
              label="Base Value" 
              name="baseValue"
              rules={[{ required: true, message: 'Please enter base value' }]}
            >
              <InputNumber
                min={0}
                placeholder="Enter base value"
                size="large"
                className="w-full"
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string) => {
                  const cleaned = value.replace(/₹\s?|(,*)/g, '');
                  return parseFloat(cleaned) || 0;
                }}
              />
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
                <SubmitButton disableForm={props.disableForm || uploading} />
                <Button
                  type="default"
                  htmlType="reset"
                  size="large"
                  disabled={props.disableForm || uploading}
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
