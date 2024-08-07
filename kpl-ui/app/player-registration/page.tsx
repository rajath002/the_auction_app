"use client";
import React, { useState } from "react";
import { ConfigProvider, theme, Typography } from "antd";
import ConfirmationDialog from "./components/ConfirmationDialog";
import RegistrationForm from "./components/RegistrationForm";

const { Title } = Typography;

export default function PlayersRegistrationPage() {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(null);
  const [disableForm, setDisableForm] = useState(false);

  const onFinish = (values: any) => {
    setDisableForm(true);
    console.log("Submit form : ", values);
    if (values?.name) {
        setTimeout(() => setSubmissionSuccess(true), 1500);
    } else {
        setTimeout(() => setSubmissionSuccess(false), 1500);
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Title className="text-center p-10" level={2}>
        Player Registration
      </Title>
      <RegistrationForm onFinish={onFinish} disableForm={disableForm} />
      <ConfirmationDialog isSuccess={submissionSuccess} />
    </ConfigProvider>
  );
}