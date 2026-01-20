# Plan: BMAD Ralph Generate - Fix Loops for Validation Steps

## Goal

Modify the bmad-ralph-generate skill to:
1. **Remove Step 5** (story-context.xml generation) - not part of the intended workflow
2. **Add fix loop to Step 2** (SM story-ready): When validation finds issues, fix them in the story and revalidate until passing
3. **Add fix loop to Step 4** (TEA test-review): When test review finds issues, fix them in the ATDD checklist and revalidate until passing

## Technical Choices

- **Loop approach**: Implement as a validate-fix-revalidate loop within each step's prompt, rather than orchestrator-level retry logic. This keeps the fix context in the same agent session.
- **Max iterations**: Cap fix loops at 3 iterations to prevent infinite loops
- **Agent type**: Same agent that validates should also fix (SM fixes stories, TEA fixes ATDD checklists)

## Current State Analysis

**Current Workflow (5 steps):**
| Step | Agent | Action | Output |
|------|-------|--------|--------|
| 1 | SM | create-story | story-{id}.md |
| 2 | SM | story-ready (validate only) | Reports issues, stops on error |
| 3 | TEA | atdd | atdd-checklist-{id}.md |
| 4 | TEA | test-review (validate only) | Reports issues, stops on error |
| 5 | SM | story-context | {id}.context.xml ← **REMOVE THIS** |

**Target Workflow (4 steps):**
| Step | Agent | Action | Output |
|------|-------|--------|--------|
| 1 | SM | create-story | story-{id}.md |
| 2 | SM | story-ready (validate + fix loop) | story-{id}.md (fixed if needed) |
| 3 | TEA | atdd | atdd-checklist-{id}.md |
| 4 | TEA | test-review (validate + fix loop) | atdd-checklist-{id}.md (fixed if needed) |

**Status Transitions (updated):**
- `backlog` → Step 1 → `drafted` → Step 2 → Step 3 (if TEA) → Step 4 (if TEA) → `ready-for-dev`

### Key Files:

- `SKILL.md` - Main skill documentation, workflow table, step descriptions
- `prompts/step_2_story_ready.txt` - SM validation prompt (needs fix loop)
- `prompts/step_4_test_review.txt` - TEA validation prompt (needs fix loop)
- `prompts/step_5_story_context.txt` - To be removed
- `prompts/step_5_story_context_no_tea.txt` - To be removed
- `scripts/prompt_builder.py` - STEP_CONFIG dict, step instructions
- `scripts/step_executor.py` - verify_step_output, status transitions, resume logic

## Tasks

### Task 1: Update SKILL.md Documentation

Update the main skill documentation to reflect the new 4-step workflow.

- [x] Update workflow table to show 4 steps instead of 5
- [x] Remove Step 5 from the "Workflow Steps" table
- [x] Update status transitions to show `ready-for-dev` happens after Step 2 (no TEA) or Step 4 (with TEA)
- [x] Update the "Critical Execution Rule" to show 4 Task tool calls
- [x] Update TEA Skip Logic section
- [x] Update Resume Logic section
- [x] Update Output Files section (remove .context.xml)
- [x] Update prompts list (remove step_5 prompts)
- [x] Update the execution example

**Files to modify:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/SKILL.md`

### Task 2: Update Step 2 Prompt with Fix Loop

Modify the step_2_story_ready.txt prompt to include a validate-fix-revalidate loop.

- [x] Add loop structure: validate → if issues found → fix → revalidate
- [x] Set max iterations to 3
- [x] On successful validation, mark story as ready
- [x] On final failure (after max iterations), exit with detailed error report
- [x] Agent should fix issues directly in story-{id}.md

**Files to modify:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/prompts/step_2_story_ready.txt`

### Task 3: Update Step 4 Prompt with Fix Loop

Modify the step_4_test_review.txt prompt to include a validate-fix-revalidate loop.

- [x] Add loop structure: validate → if issues found → fix → revalidate
- [x] Set max iterations to 3
- [x] On successful validation, confirm tests ready
- [x] On final failure (after max iterations), exit with detailed error report
- [x] Agent should fix issues directly in atdd-checklist-{id}.md

**Files to modify:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/prompts/step_4_test_review.txt`

### Task 4: Remove Step 5 from prompt_builder.py

Update the prompt_builder.py to remove Step 5 configuration.

- [x] Remove Step 5 from STEP_CONFIG dict
- [x] Remove step 5 and '5_no_tea' from STEP_INSTRUCTIONS dict
- [x] Update get_steps_for_generate() to return [1, 2, 3, 4] or [1, 2] (no TEA)
- [x] Update status transition logic (ready-for-dev after step 2 or 4, not 5)

**Files to modify:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/scripts/prompt_builder.py`

### Task 5: Update step_executor.py

Update the step executor to handle the new 4-step workflow.

- [x] Remove Step 5 from verify_step_output()
- [x] Update get_status_after_step() - ready-for-dev after step 4 (or step 2 if no TEA)
- [x] Update check_step_already_complete() to handle new flow
- [x] Update get_resume_step() for 4-step workflow
- [x] Update build_execution_plan() steps template

**Files to modify:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/scripts/step_executor.py`

### Task 6: Delete Step 5 Prompt Files

Remove the now-unused Step 5 prompt templates.

- [x] Delete `prompts/step_5_story_context.txt`
- [x] Delete `prompts/step_5_story_context_no_tea.txt`

**Files to delete:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/prompts/step_5_story_context.txt`
- `/Users/sid/.claude/skills/bmad-ralph-generate/prompts/step_5_story_context_no_tea.txt`

### Task 7: Update paths.yaml Template

Update the default paths.yaml to remove context_xml.

- [x] Remove `context_xml` path pattern from paths.yaml documentation in SKILL.md

**Files to modify:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/SKILL.md` (paths.yaml section)

### Task 8: Update config.py (if needed)

Check if config.py has any Step 5 specific logic.

- [x] Review config.py for Step 5 references
- [x] Update step_timeouts to remove step 5

**Files to review/modify:**
- `/Users/sid/.claude/skills/bmad-ralph-generate/scripts/config.py`

## Success Criteria

### Automated Verification:
- [x] Python syntax check: `python -m py_compile scripts/*.py`
- [x] No references to Step 5 in SKILL.md: `grep -i "step 5\|story-context\|context.xml" SKILL.md` returns empty

### Manual Verification:
- [ ] Run skill on a test project - workflow completes with 4 steps
- [ ] Step 2 fixes issues and revalidates (test with a story that has minor issues)
- [ ] Step 4 fixes issues and revalidates (test with an ATDD checklist that has gaps)
- [ ] Status transitions correctly to `ready-for-dev` after step 2 (no TEA) or step 4 (with TEA)

## Out of Scope

- Changing the bmad-ralph-execute skill (it consumes stories, not context.xml)
- Adding new validation rules to the checklist
- Modifying the underlying BMAD workflows (workflow.yaml files)
- Changing the story or ATDD file formats

## Risks (Pre-Mortem)

### Tigers:
- **Fix loop might not converge** (MEDIUM)
  - Mitigation: Cap at 3 iterations, on failure report all issues clearly
- **Status transition timing** (LOW)
  - Mitigation: Test both with-TEA and without-TEA flows

### Elephants:
- **Agents might struggle with fix-then-revalidate in one context** (MEDIUM)
  - Note: If issues arise, could split into separate validate and fix steps, but try single-context first
