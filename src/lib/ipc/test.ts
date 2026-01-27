/**
 * IPC Test - Verify Tauri IPC round-trip works
 *
 * Run this in browser console to test:
 * import('/src/lib/ipc/test').then(m => m.testIpc())
 */

import { invoke } from '@tauri-apps/api/core'

/**
 * Test IPC by calling the hello_world command
 * @returns Promise that resolves to the response string
 */
export async function testIpc(): Promise<string> {
  try {
    const result = await invoke<string>('hello_world', { name: 'Orion' })
    console.log('IPC test result:', result)
    return result
  } catch (error) {
    console.error('IPC test failed:', error)
    throw error
  }
}
