"use client";
import React, { useState } from "react";
import { ConfigProvider, theme, Typography } from "antd";
import ConfirmationDialog from "./components/ConfirmationDialog";
import RegistrationForm from "./components/RegistrationForm";
import axios from "axios";

const { Title } = Typography;

/**
 * Renders the player registration page.
 *
 * @returns {JSX.Element} The rendered PlayersRegistrationPage component.
 */
export default function PlayersRegistrationPage() {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(
    null
  );
  const [disableForm, setDisableForm] = useState(false);

  const onFinish = async (values: { [key: string]: any }) => {
    setDisableForm(true);
    console.log("Submit form : ", values);

    const form = new FormData();
    for (const key in values) {
      if (key === "uploadedFile") {
        form.append("uploadedFile", values[key].originFileObj);
        continue;
      }
      form.append(key, values[key]);
    }
    if (values?.name) {
      // call the API to insert the player
      const res = await axios.post("/api/players", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response : ", res);
      setSubmissionSuccess(true);
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
