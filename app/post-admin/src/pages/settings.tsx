import { SyncOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Card, Descriptions, Tag, Button, Spin, App } from "antd";
import { useGitStatus, useGitSync } from "../hooks/use-git";

export function SettingsPage() {
  const { data: status, isLoading, refetch } = useGitStatus();
  const { mutate: sync, isPending: isSyncing } = useGitSync();
  const { message } = App.useApp();

  const handleSync = () => {
    sync(undefined, {
      onSuccess: (data) => {
        message.success(data.message);
        refetch();
      },
      onError: (error) => {
        message.error(error.message);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const changesCount =
    (status?.modified.length ?? 0) +
    (status?.created.length ?? 0) +
    (status?.deleted.length ?? 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <Card title="Git Repository Status" className="max-w-2xl">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Branch">
            {status?.current}
          </Descriptions.Item>
          <Descriptions.Item label="Tracking">
            {status?.tracking || "Not set"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {status?.isClean ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Clean
              </Tag>
            ) : (
              <Tag color="warning">{changesCount} uncommitted changes</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ahead/Behind">
            {status?.ahead} ahead / {status?.behind} behind
          </Descriptions.Item>
          {(status?.modified.length ?? 0) > 0 && (
            <Descriptions.Item label="Modified">
              {status?.modified.map((file) => (
                <Tag key={file} className="mb-1">
                  {file}
                </Tag>
              ))}
            </Descriptions.Item>
          )}
          {(status?.created.length ?? 0) > 0 && (
            <Descriptions.Item label="Created">
              {status?.created.map((file) => (
                <Tag key={file} color="green" className="mb-1">
                  {file}
                </Tag>
              ))}
            </Descriptions.Item>
          )}
          {(status?.deleted.length ?? 0) > 0 && (
            <Descriptions.Item label="Deleted">
              {status?.deleted.map((file) => (
                <Tag key={file} color="red" className="mb-1">
                  {file}
                </Tag>
              ))}
            </Descriptions.Item>
          )}
        </Descriptions>

        <div className="mt-4">
          <Button
            type="primary"
            icon={<SyncOutlined spin={isSyncing} />}
            onClick={handleSync}
            loading={isSyncing}
          >
            Sync with Remote
          </Button>
        </div>
      </Card>
    </div>
  );
}
