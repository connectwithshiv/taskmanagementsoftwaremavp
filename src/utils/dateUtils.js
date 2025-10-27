import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Search, BarChart3, Users, Settings, Home, X, AlertCircle, CheckCircle, TrendingUp, Download, Upload } from 'lucide-react';
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};