"use client";
import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import ConfirmationDialog from "./components/ConfirmationDialog";
import RegistrationForm from "./components/RegistrationForm";
import { createPlayer } from "@/services/player";

// const { Title } = Typography;

export default function PlayersRegistrationPage() {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(null);
  const [disableForm, setDisableForm] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const onFinish = async (values: any) => {
    setDisableForm(true);
    console.log("Submit form : ", values);

    try {
      // Map form data to Player interface expected by service
      const playerData = {
        name: values.name,
        type: values.type, // PlayerType: BATSMAN, BOWLER, ALL_ROUNDER, WICKET_KEEPER
        category: values.level, // PlayerCategory: L1, L2, L3, L4
        image: imageUrl || "", // Use uploaded image URL or empty string
        currentBid: 0, // Default current bid
        stats: {
          baseValue: values.baseValue || 0,
          bidValue: 0, // Default bid value
          currentTeamId: null, // No team assigned initially
          status: 'AVAILABLE' as const, // Default status for new players
        },
      };

      // Use the service function to create player
      const savedPlayer = await createPlayer(playerData);

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
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      {/* <Title className="text-center p-10" level={2}>
        Player Registration
      </Title> */}
      <RegistrationForm 
        onFinish={onFinish} 
        disableForm={disableForm}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
      />
      <ConfirmationDialog isSuccess={submissionSuccess} />
    </ConfigProvider>
  );
}