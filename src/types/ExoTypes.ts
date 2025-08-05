import { TFile } from 'obsidian';

// Exo Asset System Types
export interface ExoAsset {
  file: {
    path: string;
    name: string;
    link: any;
    mtime: Date;
  };
  
  // Core Exo properties
  'exo__Asset_isDefinedBy'?: string | { path: string };
  'exo__Asset_uid'?: string;
  'exo__Asset_createdAt'?: string;
  'exo__Instance_class': (string | { path: string })[];
  'exo__Asset_relates'?: (string | { path: string })[];
  
  // Area-specific properties
  'ems__Area_parent'?: string | { path: string };
  'ems__Area_status'?: string | { path: string };
  
  // Task/Project properties
  'ems__Effort_area'?: string | { path: string };
  'ems__Effort_status'?: string | { path: string };
  'ems__Effort_prototype'?: string | { path: string };
  
  // Allow any other properties
  [key: string]: any;
}

// UI Layout System Types
export interface Layout extends ExoAsset {
  'ui__Layout_targetClass': string | { path: string };
  'ui__Layout_blocks': (string | { path: string })[];
}

export interface LayoutBlock extends ExoAsset {
  'ui__LayoutBlock_title': string;
  'ui__LayoutBlock_icon'?: string;
  'ui__LayoutBlock_queryType'?: string | { path: string };
  'ui__LayoutBlock_query': string;
  'ui__LayoutBlock_buttons'?: (string | { path: string })[];
}

export interface LayoutButton extends ExoAsset {
  'ui__LayoutButton_label': string;
  'ui__LayoutButton_action': string | { path: string };
}

export interface ButtonAction extends ExoAsset {
  'ui__ButtonAction_id': string;
}

// Query System Types
export interface WhereClause {
  property: string;
  expectedValue: string;
  operator?: 'equals' | 'contains' | 'not-equals' | 'not-contains';
}

export interface QueryColumn {
  fn: string;
  alias: string;
}

export interface DeclarativeQuery {
  columns?: QueryColumn[];
  whereClauses?: WhereClause[];
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  emptyMessage?: string;
}

// Context Types
export interface ExoFileContext {
  fileName: string;
  filePath: string;
  currentPage: ExoAsset;
  file: TFile;
  frontmatter?: Record<string, any>;
}

export interface RenderContext {
  dv: any; // DataviewAPI
  container: HTMLElement;
  fileContext: ExoFileContext;
}

// Asset Classes
export type AssetClass = 
  | 'ems__Area'
  | 'ems__Task' 
  | 'ems__Project'
  | 'ems__Meeting'
  | 'ems__MeetingPrototype'
  | 'ui__Layout'
  | 'ui__LayoutBlock'
  | 'ui__LayoutButton'
  | 'ui__ButtonAction';

// Area Creation Template
export interface AreaCreationData {
  name: string;
  parentPath: string;
  parentOntology: string;
  createdAt: string;
  uid: string;
}

// Button Actions
export type ButtonActionType = 
  | 'CreateChildArea'
  | 'CreateProperty'
  | 'CreateMeetingInstance'
  | 'EditAsset'
  | 'DeleteAsset';