"use client";
import React, { useState, useEffect } from "react";
import { ConfigProvider, theme, Table, Switch, Button, Modal, Form, Input, message, Space, Popconfirm, Checkbox, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import RoleGuard from "@/components/RoleGuard";

const ROLE_OPTIONS = [
  { label: 'Public', value: 'public', description: 'Anyone can access (no login required)' },
  { label: 'User', value: 'user', description: 'Any logged-in user' },
  { label: 'Manager', value: 'manager', description: 'Manager role' },
  { label: 'Admin', value: 'admin', description: 'Admin role only' },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'public': return 'green';
    case 'user': return 'blue';
    case 'manager': return 'orange';
    case 'admin': return 'red';
    default: return 'default';
  }
};

interface PageAccessSetting {
  id: number;
  page_route: string;
  page_name: string;
  public_access: boolean;
  allowed_roles?: string[] | null;
  description?: string;
}

export default function PageAccessManagementPage() {
  const [settings, setSettings] = useState<PageAccessSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/page-access');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        message.error('Failed to fetch page access settings');
      }
    } catch (error) {
      message.error('Error fetching settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleAccess = async (id: number, currentValue: boolean) => {
    try {
      const response = await fetch('/api/page-access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, public_access: !currentValue }),
      });

      if (response.ok) {
        message.success('Access setting updated successfully');
        fetchSettings();
      } else {
        message.error('Failed to update access setting');
      }
    } catch (error) {
      message.error('Error updating setting');
      console.error(error);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ public_access: false, allowed_roles: [] });
    setModalVisible(true);
  };

  const handleEdit = (record: PageAccessSetting) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/page-access?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Page access setting deleted successfully');
        fetchSettings();
      } else {
        message.error('Failed to delete setting');
      }
    } catch (error) {
      message.error('Error deleting setting');
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId ? { ...values, id: editingId } : values;

      const response = await fetch('/api/page-access', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        message.success(`Page access setting ${editingId ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        fetchSettings();
      } else {
        const data = await response.json();
        message.error(data.message || 'Failed to save setting');
      }
    } catch (error) {
      message.error('Error saving setting');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Page Route',
      dataIndex: 'page_route',
      key: 'page_route',
      width: 200,
    },
    {
      title: 'Page Name',
      dataIndex: 'page_name',
      key: 'page_name',
      width: 200,
    },
    {
      title: 'Allowed Roles',
      dataIndex: 'allowed_roles',
      key: 'allowed_roles',
      width: 250,
      render: (roles: string[] | null) => (
        <Space size="small" wrap>
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <Tag key={role} color={getRoleColor(role)}>
                {role.toUpperCase()}
              </Tag>
            ))
          ) : (
            <Tag color="default">No roles set</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Public Access',
      dataIndex: 'public_access',
      key: 'public_access',
      width: 150,
      render: (value: boolean, record: PageAccessSetting) => (
        <Switch
          checked={value}
          onChange={() => handleToggleAccess(record.id, value)}
          checkedChildren="Public"
          unCheckedChildren="Private"
        />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: PageAccessSetting) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this setting?"
            description="Are you sure you want to delete this page access setting?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
          <div className="h-20"></div>
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Page Access Management</h1>
                <p className="mt-2 text-gray-400">
                  Control which roles can access specific pages (Admin, Manager, User, or Public)
                </p>
              </div>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchSettings}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  className="!bg-amber-400 !font-semibold !text-gray-900 hover:!bg-amber-300"
                >
                  Add Page Setting
                </Button>
              </Space>
            </div>

            <div className="rounded-xl border border-white/10 bg-gray-900/50 p-6 backdrop-blur">
              <Table
                columns={columns}
                dataSource={settings}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </div>

            <Modal
              title={editingId ? "Edit Page Access Setting" : "Add Page Access Setting"}
              open={modalVisible}
              onCancel={() => {
                setModalVisible(false);
                form.resetFields();
              }}
              footer={null}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ public_access: false, allowed_roles: [] }}
              >
                <Form.Item
                  name="page_route"
                  label="Page Route"
                  rules={[{ required: true, message: 'Please enter the page route' }]}
                  extra="e.g., /, /teams, /players-list"
                >
                  <Input placeholder="/example-page" disabled={!!editingId} />
                </Form.Item>

                <Form.Item
                  name="page_name"
                  label="Page Name"
                  rules={[{ required: true, message: 'Please enter the page name' }]}
                >
                  <Input placeholder="Example Page" />
                </Form.Item>

                <Form.Item
                  name="allowed_roles"
                  label="Allowed Roles"
                  tooltip="Select which roles can access this page. Leave empty to use legacy public_access setting."
                >
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {ROLE_OPTIONS.map((option) => (
                        <Checkbox key={option.value} value={option.value}>
                          <span className="font-semibold">{option.label}</span>
                          <span className="ml-2 text-xs text-gray-400">- {option.description}</span>
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item
                  name="public_access"
                  label="Public Access (Legacy)"
                  valuePropName="checked"
                  tooltip="Deprecated: Use 'Allowed Roles' instead. This field is kept for backward compatibility."
                >
                  <Switch checkedChildren="Public" unCheckedChildren="Private" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea
                    placeholder="Description of the page"
                    rows={3}
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Space className="flex justify-end">
                    <Button onClick={() => setModalVisible(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="!bg-amber-400 !font-semibold !text-gray-900 hover:!bg-amber-300"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      </ConfigProvider>
    </RoleGuard>
  );
}
