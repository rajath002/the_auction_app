"use client";
import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import ConfirmationDialog from "./components/ConfirmationDialog";
import RegistrationForm from "./components/RegistrationForm";
import { createPlayer } from "@/services/player";
import RoleGuard from "@/components/RoleGuard";
import { PlayerStatus } from "@/types/player-enums";

// const { Title } = Typography;

export default function PlayersRegistrationPage() {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(null);
  const [disableForm, setDisableForm] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [formKey, setFormKey] = useState(0);

  const handleReset = () => {
    setSubmissionSuccess(null);
    setImageUrl('');
    setFormKey(prev => prev + 1); // Force re-render of form
  };

  const onFinish = async (values: any, _imageUrl?: string) => {
    setDisableForm(true);
    try {
      // Map form data to Player interface expected by service
      const playerData = {
        name: values.name,
        type: values.type, // PlayerType: BATSMAN, BOWLER, ALL_ROUNDER, WICKET_KEEPER
        category: values.level, // PlayerCategory: L1, L2, L3, L4
        image: _imageUrl || "", // Use uploaded image URL or empty string
        base_value: values.baseValue || 0,
        bid_value: values.baseValue || 0,
        status: PlayerStatus.AVAILABLE,
        role: values.role || "player",
        // currentBid: 0, // Default current bid
        // stats: {
        //   baseValue: values.baseValue || 0,
        //   bidValue: 0, // Default bid value
        //   currentTeamId: null, // No team assigned initially
        //   status: 'AVAILABLE' as const, // Default status for new players
        // },
      };

      // Use the service function to create player
      const savedPlayer = await createPlayer([playerData]);

      if (savedPlayer) {
        console.log('Player saved successfully:', savedPlayer);
        setSubmissionSuccess(true);
        setImageUrl(''); // Reset image URL after successful submission
      } else {
        console.error('Failed to save player: Service returned null');
        setSubmissionSuccess(false);
      }
    } catch (error) {
      console.error('Error saving player:', error);
      setSubmissionSuccess(false);
    } finally {
      setDisableForm(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        {/* <Title className="text-center p-10" level={2}>
          Player Registration
        </Title> */}
        <div className="h-20" />
        <RegistrationForm 
          key={formKey}
          onFinish={onFinish} 
          disableForm={disableForm}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
        />
        <ConfirmationDialog isSuccess={submissionSuccess} onReset={handleReset} />
      </ConfigProvider>
    </RoleGuard>
  );
}