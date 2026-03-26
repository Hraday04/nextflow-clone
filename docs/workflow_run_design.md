# Workflow Run Design

## Data Model

When a new workflow is triggered, the engine should create a `WorkflowRun` object. Here is a generic JSON schema representing what to store:

```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "run_name": "modest_einstein",
  "workflow_path": "/path/to/script.nf",
  "status": "RUNNING",
  "work_dir": "/path/to/work/dir",
  "timestamps": {
    "submitted": "2023-10-12T10:00:00Z",
    "started": "2023-10-12T10:00:05Z",
    "completed": null
  },
  "parameters": {
    "input": "s3://bucket/data.fastq",
    "threads": 4
  },
  "tasks": ["task-id-1", "task-id-2"],
  "error_report": null
}
```

## Storage Strategy

1. **File-Based (Resumable)**
   Every time a state changes, incrementally write to an append-only log or update a lightweight `SQLite` database located in `.nextflow-app/history.db`.
2. **In-Memory Cache**
   Keep the active `WorkflowRun` in memory during execution for quick task dispatching and state checks, syncing asynchronously to disk to prevent locking.

## Checking the Status

### User Checking (CLI)

Users check the status of active and past runs by querying the stored state (e.g., the SQLite database).

- **List Runs:** A CLI command like `nextflow-clone log` or `nextflow-clone ps` parses the database to list run IDs, status, and completion times.
- **Inspect Specific Run:** `nextflow-clone inspect <run_id>` fetches detailing including tasks, parameters, and paths.

### Engine Checking (Execution Monitoring)

During execution, the engine must monitor the status of individual tasks to update the `WorkflowRun` status.

1. **Polling:** The engine periodically polls the execution environment (e.g., checking PID exit codes locally, or querying SLURM/AWS Batch) for task completion.
2. **Event-Driven:** Tasks write `.exitcode` or `.command.log` files upon completion. The engine uses file system watchers (like `inotify`) to detect these files and trigger task completion logic, subsequently updating the overall `WorkflowRun` status.
3. **Heartbeat:** Periodically update an `updated_at` timestamp in the database to distinguish between `RUNNING` and `FAILED/STALLED` (in case the engine crashes unexpectedly).
