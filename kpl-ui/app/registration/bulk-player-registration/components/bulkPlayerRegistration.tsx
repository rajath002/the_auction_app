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
  FormInstance,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useCallback, useRef, useState } from "react";
import SubmitButton from "@/app/components/SubmitButton";
import { host } from "@/config";
import { uploadPlayersExcelSheet } from "@/services/player";
import { ReadExcelFileData } from "@/utils/fileUtils";

interface SubmissionFormType {
  onFinish: (e: FormData) => void;
  disableForm: boolean;
}

export default function BulkPlayerRegistrationForm() {
  const [fileList, setFileList] = useState<any[]>([]);
  const formRef = useRef<FormInstance>(null);

  /**
   * @deprecated will be removed in future
   */
  const onSubmit = useCallback((e: any) => {
    console.log("onSubmit", e);

    const originFileObj = e.upload.fileList[0].originFileObj;
    const formData = new FormData();
    formData.append("uploadedFile", originFileObj);

    // uploadPlayersExcelSheet(formData);
  }, [])

  const onSubmitV2 = useCallback(async (e: {upload: {fileList: any[]}}) => {
    const originFileObj = e.upload.fileList[0].originFileObj;
    const jsonData = await ReadExcelFileData(originFileObj);
    uploadPlayersExcelSheet(jsonData);
  }, []);

  // Handle file change (AntD Upload component)
  const handleFileChange = useCallback((param) => {
    setFileList(param.fileList);
  }, [setFileList]);

  return (
    <Row gutter={16} align={"middle"} justify={"center"}>
      <Col>
        <Card style={{ width: 800 }} title="Please enter below details">
          <Form
          ref={formRef}
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            style={{ maxWidth: 600 }}
            onFinish={onSubmitV2}
            encType="multipart/form-data"
          >
            {/* Download the sample copy */}
            <Form.Item label="Download Sample" style={{ marginBottom: 0 }}>
            <Space style={{ paddingBottom: 16 }} >
              <Button href={host+"/player_data_template.xlsx"} target="_blank" type="primary">
                Download Sample Template
              </Button>
            </Space >
            </Form.Item>
            {/* Upload image */}
            <Form.Item label="Upload" name="upload">
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
