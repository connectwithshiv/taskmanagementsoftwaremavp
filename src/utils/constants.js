// Constants
export const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'file', label: 'File' }
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' }
];

export const SEARCH_TYPE_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'id', label: 'ID' },
  { value: 'tags', label: 'Tags' }
];

export const SORT_OPTIONS = [
  { value: 'name', label: 'Sort: Name' },
  { value: 'date', label: 'Sort: Date' },
  { value: 'priority', label: 'Sort: Priority' }
];

// utils/constants.js - User-related constants

// utils/constants.js - Application Constants

export const USER_FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea', 
  NUMBER: 'number',
  EMAIL: 'email',
  DATE: 'date',
  CHECKBOX: 'checkbox'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

export const USER_ACTIONS = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  PASSWORD_CHANGE: 'Password Changed'
};

export const PERMISSIONS = {
  USER_CREATE: 'user_create',
  USER_READ: 'user_read',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  ROLE_MANAGE: 'role_manage',
  POSITION_MANAGE: 'position_manage',
  FIELD_MANAGE: 'field_manage'
};

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200
};