"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Player } from "@/interface/interfaces";
import type { UploadFile } from "antd";
import axios from "axios";
import Image from "next/image";

const { Option } = Select;

// Define enums locally to avoid importing from Sequelize model
const PlayerType = {
  BATSMAN: 'Batsman',
  BOWLER: 'Bowler',
  ALL_ROUNDER: 'All-Rounder',
  WICKET_KEEPER: 'Wicket-Keeper',
} as const;

const PlayerCategory = {
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  L4: 'L4',
} as const;

interface PlayerEditModalProps {
  visible: boolean;
  player: Player | null;
  onCancel: () => void;
  onSave: (updatedPlayer: Partial<Player>) => Promise<void>;
}

const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  visible,
  player,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (player) {
      form.setFieldsValue({
        name: player.name,
        type: player.type,
        category: player.category,
        baseValue: player.baseValue,
        bidValue: player.bidValue,
        currentBid: player.currentBid,
        status: player.status,
      });
      setImageUrl(player.image || "");
      setFileList([]);
    } else {
      form.resetFields();
      setImageUrl("");
      setFileList([]);
    }
  }, [player, form]);

//   const handleImageUpload = async () => {
//     if (fileList.length === 0) {
//       return imageUrl; // Return existing image if no new upload
//     }

//     const formData = new FormData();
//     formData.append("file", fileList[0] as any);

//     setUploading(true);
//     try {
//       const response = await axios.post("/api/imagekit/upload", formData);
//       if (response.data.success) {
//         message.success("Image uploaded successfully!");
//         return response.data.url;
//       } else {
//         message.error("Image upload failed");
//         return imageUrl;
//       }
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       message.error("Failed to upload image");
//       return imageUrl;
//     } finally {
//       setUploading(false);
//     }
//   };

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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Upload image if there's a new file
      const finalImageUrl = await uploadImageToImageKit(fileList[0] as any);

      const updatedPlayer: Partial<Player> = {
        id: player?.id,
        name: values.name,
        type: values.type,
        category: values.category,
        baseValue: values.baseValue,
        bidValue: values.bidValue || 0,
        currentBid: values.currentBid || 0,
        status: values.status,
        image: finalImageUrl,
      };

      await onSave(updatedPlayer);
      form.resetFields();
      setFileList([]);
      setImageUrl("");
    } catch (error) {
      console.error("Validation or save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setImageUrl("");
    onCancel();
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return false;
      }
      setFileList([file as any]);
      return false; // Prevent automatic upload
    },
    fileList,
  };

  return (
    <Modal
      title={`Edit Player: ${player?.name || ""}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading || uploading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="edit_player_form"
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="name"
          label="Player Name"
          rules={[{ required: true, message: "Please enter player name" }]}
        >
          <Input placeholder="Enter player name" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Player Type"
          rules={[{ required: true, message: "Please select player type" }]}
        >
          <Select placeholder="Select player type">
            <Option value={PlayerType.BATSMAN}>{PlayerType.BATSMAN}</Option>
            <Option value={PlayerType.BOWLER}>{PlayerType.BOWLER}</Option>
            <Option value={PlayerType.ALL_ROUNDER}>{PlayerType.ALL_ROUNDER}</Option>
            <Option value={PlayerType.WICKET_KEEPER}>{PlayerType.WICKET_KEEPER}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select category" }]}
        >
          <Select placeholder="Select category">
            <Option value={PlayerCategory.L1}>{PlayerCategory.L1}</Option>
            <Option value={PlayerCategory.L2}>{PlayerCategory.L2}</Option>
            <Option value={PlayerCategory.L3}>{PlayerCategory.L3}</Option>
            <Option value={PlayerCategory.L4}>{PlayerCategory.L4}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="baseValue"
          label="Base Value"
          rules={[{ required: true, message: "Please enter base value" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="Enter base value"
          />
        </Form.Item>

        <Form.Item name="bidValue" label="Bid Value">
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="Enter bid value"
          />
        </Form.Item>

        <Form.Item name="currentBid" label="Current Bid">
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="Enter current bid"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select placeholder="Select status">
            <Option value="AVAILABLE">AVAILABLE</Option>
            <Option value="SOLD">SOLD</Option>
            <Option value="UNSOLD">UNSOLD</Option>
            <Option value="In-Progress">In-Progress</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Player Image">
          {imageUrl && (
            <div style={{ marginBottom: 10 }}>
              <Image
                src={imageUrl}
                alt="Current player"
                width={200}
                height={200}
                style={{
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </div>
          )}
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>
              {fileList.length > 0 ? "Change Image" : "Upload New Image"}
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlayerEditModal;
