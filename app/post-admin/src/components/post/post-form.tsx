import { SaveOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Switch,
  Select,
  DatePicker,
  Card,
  Button,
  Space,
} from "antd";
import dayjs from "dayjs";
import type { PostFrontmatter } from "../../types/post";

interface PostFormProps {
  initialValues?: PostFrontmatter;
  onSubmit: (frontmatter: PostFrontmatter) => void;
  isLoading?: boolean;
  isCreate?: boolean;
}

export function PostForm({
  initialValues,
  onSubmit,
  isLoading,
  isCreate,
}: PostFormProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const frontmatter: PostFrontmatter = {
      title: values.title as string,
      slug: values.slug as string,
      description: (values.description as string) || "",
      date: (values.date as dayjs.Dayjs).toISOString(),
      publishedDate: values.publishedDate
        ? (values.publishedDate as dayjs.Dayjs).toISOString()
        : undefined,
      updated: values.updated
        ? (values.updated as dayjs.Dayjs).toISOString()
        : undefined,
      tags: values.tags as string[],
      published: values.published as boolean,
      highlight: values.highlight as boolean | undefined,
      copyright: values.copyright as boolean | undefined,
    };
    onSubmit(frontmatter);
  };

  const formInitialValues = initialValues
    ? {
        ...initialValues,
        date: dayjs(initialValues.date),
        publishedDate: initialValues.publishedDate
          ? dayjs(initialValues.publishedDate)
          : undefined,
        updated: initialValues.updated
          ? dayjs(initialValues.updated)
          : undefined,
      }
    : {
        date: dayjs(),
        published: false,
        tags: [],
        copyright: true,
      };

  return (
    <Card size="small">
      <Form
        form={form}
        layout="vertical"
        initialValues={formInitialValues}
        onFinish={handleFinish}
        size="small"
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Post title" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: "Slug is required" },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Slug must be lowercase with hyphens only",
            },
          ]}
        >
          <Input placeholder="post-url-slug" disabled={!isCreate} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Brief description..." />
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Date is required" }]}
        >
          <DatePicker showTime className="w-full" />
        </Form.Item>

        <Form.Item name="publishedDate" label="Published Date">
          <DatePicker showTime className="w-full" />
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags"
          rules={[{ required: true, message: "At least one tag is required" }]}
        >
          <Select
            mode="tags"
            placeholder="Add tags..."
            tokenSeparators={[","]}
          />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item name="published" valuePropName="checked">
            <Space>
              <Switch size="small" />
              <span className="text-sm">Published</span>
            </Space>
          </Form.Item>

          <Form.Item name="highlight" valuePropName="checked">
            <Space>
              <Switch size="small" />
              <span className="text-sm">Highlight</span>
            </Space>
          </Form.Item>

          <Form.Item name="copyright" valuePropName="checked">
            <Space>
              <Switch size="small" />
              <span className="text-sm">Copyright</span>
            </Space>
          </Form.Item>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={isLoading}
            block
          >
            {isCreate ? "Create Post" : "Save Changes"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
