"use client";
import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import BulkRegistrationForm from "./components/BulkRegistrationForm";
import ConfirmationDialog from "./components/ConfirmationDialog";
import RoleGuard from "@/components/RoleGuard";

export default function BulkPlayersRegistrationPage() {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(null);
  const [disableForm, setDisableForm] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  const onFinish = async (data: any[]) => {
    setDisableForm(true);
    console.log("Submit bulk data: ", data);
    setUploadedData(data);
    
    if (data && data.length > 0) {
      try {
        // Transform data to match API expectations
        const transformedData = data.map(player => ({
          name: player.name,
          category: player.category,
          type: player.type,
          base_value: player.baseValue,
          bid_value: player.baseValue || 0,
          image: player.imageUrl,
          role: player.role || null,
          status: 'AVAILABLE',
        }));

        const response = await fetch('/api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transformedData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Players created successfully:', result);
          setSubmissionSuccess(true);
        } else {
          const error = await response.json();
          console.error('Failed to create players:', error);
          setSubmissionSuccess(false);
        }
      } catch (error) {
        console.error('Error submitting players:', error);
        setSubmissionSuccess(false);
      }
    } else {
      setSubmissionSuccess(false);
    }
    
    setDisableForm(false);
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
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
    </RoleGuard>
  );
}
