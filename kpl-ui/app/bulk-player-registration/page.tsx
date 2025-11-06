"use client";
import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import BulkRegistrationForm from "./components/BulkRegistrationForm";
import ConfirmationDialog from "./components/ConfirmationDialog";

export default function BulkPlayersRegistrationPage() {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(null);
  const [disableForm, setDisableForm] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  const onFinish = (data: any[]) => {
    setDisableForm(true);
    console.log("Submit bulk data: ", data);
    setUploadedData(data);
    
    if (data && data.length > 0) {
      // Simulate API call
      setTimeout(() => {
        setSubmissionSuccess(true);
        setDisableForm(false);
      }, 1500);
    } else {
      setTimeout(() => {
        setSubmissionSuccess(false);
        setDisableForm(false);
      }, 1500);
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <BulkRegistrationForm 
        onFinish={onFinish} 
        disableForm={disableForm}
        uploadedData={uploadedData}
      />
      <ConfirmationDialog 
        isSuccess={submissionSuccess} 
        recordCount={uploadedData.length}
      />
    </ConfigProvider>
  );
}
