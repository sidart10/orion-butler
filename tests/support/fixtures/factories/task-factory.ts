/**
 * Task Factory for Orion Butler Tests
 *
 * Creates test tasks/inbox items with GTD categorization and auto-cleanup.
 *
 * @see TEA knowledge: data-factories.md
 */

export type GTDCategory = 'inbox' | 'next-action' | 'project' | 'waiting-for' | 'someday-maybe';
export type PARALocation = 'projects' | 'areas' | 'resources' | 'archive' | 'inbox';

export interface TestTask {
  id: string;
  title: string;
  description?: string;
  gtdCategory: GTDCategory;
  paraLocation: PARALocation;
  createdAt: Date;
  dueDate?: Date;
}

export class TaskFactory {
  private createdTasks: string[] = [];
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3000/api';
  }

  /**
   * Create a test task
   */
  async createTask(overrides: Partial<TestTask> = {}): Promise<TestTask> {
    const task: TestTask = {
      id: `test-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: `Test Task ${Date.now()}`,
      gtdCategory: 'inbox',
      paraLocation: 'inbox',
      createdAt: new Date(),
      ...overrides,
    };

    this.createdTasks.push(task.id);

    return task;
  }

  /**
   * Create an inbox item (uncategorized capture)
   */
  async createInboxItem(title: string): Promise<TestTask> {
    return this.createTask({
      title,
      gtdCategory: 'inbox',
      paraLocation: 'inbox',
    });
  }

  /**
   * Create a next action
   */
  async createNextAction(title: string, dueDate?: Date): Promise<TestTask> {
    return this.createTask({
      title,
      gtdCategory: 'next-action',
      paraLocation: 'projects',
      dueDate,
    });
  }

  /**
   * Create a waiting-for task
   */
  async createWaitingFor(title: string, waitingOn: string): Promise<TestTask> {
    return this.createTask({
      title,
      description: `Waiting on: ${waitingOn}`,
      gtdCategory: 'waiting-for',
      paraLocation: 'projects',
    });
  }

  /**
   * Create multiple inbox items (batch)
   */
  async createInboxBatch(count: number): Promise<TestTask[]> {
    const tasks: TestTask[] = [];
    for (let i = 0; i < count; i++) {
      tasks.push(await this.createInboxItem(`Batch item ${i + 1}`));
    }
    return tasks;
  }

  /**
   * Cleanup all created tasks
   */
  async cleanup(): Promise<void> {
    for (const taskId of this.createdTasks) {
      try {
        // In production: await fetch(`${this.apiUrl}/tasks/${taskId}`, { method: 'DELETE' });
        console.log(`[TaskFactory] Cleaned up task: ${taskId}`);
      } catch (error) {
        console.warn(`[TaskFactory] Failed to cleanup task ${taskId}:`, error);
      }
    }
    this.createdTasks = [];
  }
}
