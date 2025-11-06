import {
  Button,
  Card,
  Space,
  Row,
  Col,
  Spin,
  Upload,
  Table,
  Alert,
  message,
} from "antd";
import { 
  LoadingOutlined, 
  UploadOutlined, 
  DownloadOutlined,
  InboxOutlined 
} from "@ant-design/icons";
import { useState } from "react";
import type { UploadProps } from "antd";
import * as XLSX from "xlsx";

interface BulkRegistrationFormProps {
  onFinish: (data: any[]) => void;
  disableForm: boolean;
  uploadedData: any[];
}

const { Dragger } = Upload;

export default function BulkRegistrationForm(props: BulkRegistrationFormProps) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isValidData, setIsValidData] = useState(false);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNo',
      key: 'contactNo',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  const validateData = (data: any[]): boolean => {
    if (!data || data.length === 0) return false;
    
    // Check if all required fields are present
    return data.every(row => 
      row.name && 
      row.level && 
      row.dateOfBirth && 
      row.contactNo && 
      row.email
    );
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        // Add keys for table
        const dataWithKeys = json.map((item: any, index) => ({
          ...item,
          key: index,
        }));
        
        setParsedData(dataWithKeys);
        const isValid = validateData(dataWithKeys);
        setIsValidData(isValid);
        
        if (isValid) {
          message.success(`Successfully parsed ${dataWithKeys.length} records`);
        } else {
          message.error('Invalid data format. Please check the required fields.');
        }
      } catch (error) {
        message.error('Error parsing file. Please check the format.');
        console.error('Parse error:', error);
      }
    };
    
    reader.readAsBinaryString(file);
    return false; // Prevent auto upload
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      setFileList([file]);
      handleFileUpload(file);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setParsedData([]);
      setIsValidData(false);
    },
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        name: 'John Doe',
        level: 'L1',
        dateOfBirth: '15-Jan-1990',
        contactNo: '9876543210',
        email: 'john@example.com',
      },
      {
        name: 'Jane Smith',
        level: 'L2',
        dateOfBirth: '20-Feb-1992',
        contactNo: '9876543211',
        email: 'jane@example.com',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');
    XLSX.writeFile(wb, 'player_registration_template.xlsx');
  };

  const handleSubmit = () => {
    if (isValidData && parsedData.length > 0) {
      props.onFinish(parsedData);
    }
  };

  return (
    <Row align={"middle"} justify={"center"} className="min-h-screen py-8">
      <Col xs={22} sm={20} md={18} lg={16} xl={14}>
        <Card 
          title="Bulk Player Registration" 
          className="shadow-lg"
          headStyle={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            textAlign: 'center' 
          }}
        >
          <Space direction="vertical" size="large" className="w-full">
            <Alert
              message="Upload Instructions"
              description={
                <div>
                  <p>1. Download the template file below</p>
                  <p>2. Fill in the player details (Name, Level, Date of Birth, Contact Number, Email)</p>
                  <p>3. Upload the completed Excel file</p>
                  <p>4. Review the data and submit</p>
                </div>
              }
              type="info"
              showIcon
            />

            <Button 
              type="dashed" 
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
              size="large"
              className="w-full"
            >
              Download Template
            </Button>

            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag Excel file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for .xlsx and .xls files only
              </p>
            </Dragger>

            {parsedData.length > 0 && (
              <>
                <Alert
                  message={`${parsedData.length} players found in the file`}
                  type={isValidData ? "success" : "warning"}
                  showIcon
                />
                
                <div className="overflow-x-auto">
                  <Table 
                    columns={columns} 
                    dataSource={parsedData}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 800 }}
                  />
                </div>
              </>
            )}

            <Space className="w-full justify-center">
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                disabled={!isValidData || props.disableForm || parsedData.length === 0}
              >
                {props.disableForm ? (
                  <>
                    Submitting...
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                  </>
                ) : (
                  `Submit ${parsedData.length} Players`
                )}
              </Button>
              
              <Button
                size="large"
                onClick={() => {
                  setFileList([]);
                  setParsedData([]);
                  setIsValidData(false);
                }}
                disabled={props.disableForm}
              >
                Clear
              </Button>
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
