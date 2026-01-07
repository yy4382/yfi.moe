import { RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Tag, Spinner, Descriptions } from "../components/ui";
import { useGitStatus, useGitSync } from "../hooks/use-git";

export function SettingsPage() {
  const { data: status, isLoading, refetch } = useGitStatus();
  const { mutate: sync, isPending: isSyncing } = useGitSync();

  const handleSync = () => {
    sync(undefined, {
      onSuccess: (data) => {
        toast.success(data.message);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const changesCount =
    (status?.modified.length ?? 0) +
    (status?.created.length ?? 0) +
    (status?.deleted.length ?? 0);

  const descriptionItems = [
    {
      label: "Branch",
      children: <span className="font-mono text-sm">{status?.current}</span>,
    },
    {
      label: "Tracking",
      children: (
        <span className="font-mono text-sm">
          {status?.tracking || "Not set"}
        </span>
      ),
    },
    {
      label: "Status",
      children: status?.isClean ? (
        <Tag icon={<CheckCircle className="h-3 w-3" />} color="success">
          Clean
        </Tag>
      ) : (
        <Tag color="warning">{changesCount} uncommitted changes</Tag>
      ),
    },
    {
      label: "Ahead/Behind",
      children: (
        <span className="text-sm">
          {status?.ahead} ahead / {status?.behind} behind
        </span>
      ),
    },
  ];

  if ((status?.modified.length ?? 0) > 0) {
    descriptionItems.push({
      label: "Modified",
      children: (
        <div className="flex flex-wrap gap-1">
          {status?.modified.map((file) => (
            <Tag key={file}>{file}</Tag>
          ))}
        </div>
      ),
    });
  }

  if ((status?.created.length ?? 0) > 0) {
    descriptionItems.push({
      label: "Created",
      children: (
        <div className="flex flex-wrap gap-1">
          {status?.created.map((file) => (
            <Tag key={file} color="success">
              {file}
            </Tag>
          ))}
        </div>
      ),
    });
  }

  if ((status?.deleted.length ?? 0) > 0) {
    descriptionItems.push({
      label: "Deleted",
      children: (
        <div className="flex flex-wrap gap-1">
          {status?.deleted.map((file) => (
            <Tag key={file} color="danger">
              {file}
            </Tag>
          ))}
        </div>
      ),
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Settings</h1>

      <Card title="Git Repository Status" className="max-w-2xl">
        <Descriptions items={descriptionItems} />

        <div className="mt-6">
          <Button
            variant="primary"
            icon={
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              />
            }
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
