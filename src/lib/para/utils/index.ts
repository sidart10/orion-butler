/**
 * PARA Utilities
 * Epic 4: PARA-Based File Structure
 *
 * Re-exports utility functions for PARA entities.
 */

// ID Generators
export {
  generateProjectId,
  generateAreaId,
  generateContactId,
  generateInboxId,
  generateResourceId,
  generateTemplateId,
  // Validators
  isValidId,
  isValidProjectId,
  isValidAreaId,
  isValidContactId,
  isValidInboxId,
  isValidResourceId,
  isValidTemplateId,
  // Helpers
  getIdPrefix,
  getIdSuffix,
  // Constants
  ID_PREFIXES,
} from './ids';
