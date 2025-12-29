import { LockOutlined } from "@ant-design/icons";
import { Form, Input, Button, Card, App } from "antd";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = (values: { token: string }) => {
    if (!values.token.trim()) {
      message.error("Please enter a token");
      return;
    }
    login(values.token.trim());
    message.success("Logged in successfully");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Post Admin</h1>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="token"
            label="Auth Token"
            rules={[{ required: true, message: "Please enter your token" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your auth token"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
