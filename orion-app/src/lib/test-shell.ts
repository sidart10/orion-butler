// Test shell execution via Tauri
import { Command } from "@tauri-apps/plugin-shell";

export async function testShellExecution(): Promise<string> {
  try {
    const output = await Command.create("echo", ["Hello from Tauri"]).execute();
    return output.stdout;
  } catch (error) {
    console.error("Shell execution failed:", error);
    throw error;
  }
}

export async function executeCommand(
  program: string,
  args: string[]
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  try {
    const output = await Command.create(program, args).execute();
    return {
      stdout: output.stdout,
      stderr: output.stderr,
      code: output.code,
    };
  } catch (error) {
    console.error("Command execution failed:", error);
    throw error;
  }
}
