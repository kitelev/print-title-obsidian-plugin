import { App } from 'obsidian';
import { ExoAsset } from '../types/ExoTypes';

export class DataviewAdapter {
  private isReady = false;
  private readyPromise: Promise<void> | null = null;

  constructor(private app: App) {
    this.initializeDataview();
  }

  private async initializeDataview(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = new Promise((resolve) => {
      const checkDataview = () => {
        const dataviewAPI = (this.app as any).plugins?.plugins?.dataview?.api;
        if (dataviewAPI && dataviewAPI.index?.initialized) {
          this.isReady = true;
          resolve();
        } else {
          setTimeout(checkDataview, 100);
        }
      };
      checkDataview();
    });

    return this.readyPromise;
  }

  async waitForIndexReady(): Promise<void> {
    await this.initializeDataview();
  }

  get api() {
    return (this.app as any).plugins?.plugins?.dataview?.api;
  }

  get name(): string {
    return 'Dataview';
  }

  /**
   * Query all pages or pages from a specific source
   */
  async queryPages(source?: string): Promise<ExoAsset[]> {
    await this.waitForIndexReady();
    
    const api = this.api;
    if (!api) {
      console.error('[DataviewAdapter] Dataview API not available');
      return [];
    }

    try {
      const pages = source ? api.pages(source) : api.pages();
      return pages.array().map((page: any) => this.convertDataviewPageToExoAsset(page));
    } catch (error) {
      console.error('[DataviewAdapter] Error querying pages:', error);
      return [];
    }
  }

  /**
   * Get a specific page by path or name
   */
  async getPage(pathOrName: string): Promise<ExoAsset | null> {
    await this.waitForIndexReady();
    
    const api = this.api;
    if (!api) {
      console.error('[DataviewAdapter] Dataview API not available');
      return null;
    }

    try {
      const page = api.page(pathOrName);
      if (!page) return null;
      
      return this.convertDataviewPageToExoAsset(page);
    } catch (error) {
      console.error('[DataviewAdapter] Error getting page:', error);
      return null;
    }
  }

  /**
   * Find assets by class
   */
  async findAssetsByClass(assetClass: string): Promise<ExoAsset[]> {
    await this.waitForIndexReady();
    
    const api = this.api;
    if (!api) {
      console.error('[DataviewAdapter] Dataview API not available');
      return [];
    }

    try {
      const pages = api.pages().where((p: any) => {
        const instanceClass = p['exo__Instance_class'] || p['exo__instance_class'];
        if (!instanceClass) return false;
        
        if (Array.isArray(instanceClass)) {
          return instanceClass.some((cls: any) => 
            typeof cls === 'string' ? cls.includes(assetClass) : cls.path?.includes(assetClass)
          );
        } else if (typeof instanceClass === 'string') {
          return instanceClass.includes(assetClass);
        } else if (instanceClass.path) {
          return instanceClass.path.includes(assetClass);
        }
        return false;
      });

      return pages.array().map((page: any) => this.convertDataviewPageToExoAsset(page));
    } catch (error) {
      console.error('[DataviewAdapter] Error finding assets by class:', error);
      return [];
    }
  }

  /**
   * Find child areas for a given parent area
   */
  async findChildAreas(parentAreaName: string): Promise<ExoAsset[]> {
    await this.waitForIndexReady();
    
    const api = this.api;
    if (!api) {
      console.error('[DataviewAdapter] Dataview API not available');
      return [];
    }

    try {
      const pages = api.pages().where((p: any) => {
        const instanceClass = p['exo__Instance_class'] || p['exo__instance_class'];
        const parent = p['ems__Area_parent'];
        
        // Check if this is an ems__Area
        const isArea = Array.isArray(instanceClass) 
          ? instanceClass.some((cls: any) => 
              typeof cls === 'string' ? cls.includes('ems__Area') : cls.path?.includes('ems__Area')
            )
          : typeof instanceClass === 'string' 
            ? instanceClass.includes('ems__Area')
            : instanceClass?.path?.includes('ems__Area');
        
        if (!isArea || !parent) return false;
        
        // Check if parent matches
        const parentName = typeof parent === 'string' 
          ? parent.replace(/[\[\]]/g, '')
          : parent.path?.split('/').pop()?.replace('.md', '');
        
        return parentName === parentAreaName;
      });

      return pages.array().map((page: any) => this.convertDataviewPageToExoAsset(page));
    } catch (error) {
      console.error('[DataviewAdapter] Error finding child areas:', error);
      return [];
    }
  }

  /**
   * Convert Dataview page object to ExoAsset format
   */
  convertDataviewPageToExoAsset(page: any): ExoAsset {
    if (!page) return null as any;
    
    // Start with copying all direct properties
    const asset: any = {};
    
    // Copy all properties that don't start with $ (Dataview internal)
    for (const [key, value] of Object.entries(page)) {
      if (!key.startsWith('$')) {
        asset[key] = value;
      }
    }
    
    // Set file info
    asset.file = {
      path: page.file?.path || page.$path || page.path,
      name: page.file?.name || page.$name || page.name || page.$path?.split('/').pop(),
      link: page.file?.link || page.$link || page.link,
      mtime: page.file?.mtime || page.$mtime || new Date()
    };
    
    // Extract frontmatter properties if not already present
    if (page.$frontmatter) {
      for (const [key, value] of Object.entries(page.$frontmatter)) {
        // Only set if not already present from direct properties
        if (!(key in asset)) {
          // Extract the actual value from Dataview's frontmatter format
          const actualValue = (value as any)?.value !== undefined ? (value as any).value : value;
          asset[key] = actualValue;
        }
      }
    }
    
    return asset as ExoAsset;
  }

  /**
   * Check if current page is an ems__Area
   */
  isEmsArea(asset: ExoAsset): boolean {
    const instanceClass = asset['exo__Instance_class'] || asset['exo__instance_class'];
    if (!instanceClass) return false;
    
    if (Array.isArray(instanceClass)) {
      return instanceClass.some((cls: any) => 
        typeof cls === 'string' ? cls.includes('ems__Area') : cls?.path?.includes('ems__Area')
      );
    } else if (typeof instanceClass === 'string') {
      return (instanceClass as string).includes('ems__Area');
    } else if (instanceClass && typeof instanceClass === 'object' && (instanceClass as any).path) {
      return (instanceClass as any).path.includes('ems__Area');
    }
    return false;
  }

  /**
   * Extract class names from an asset
   */
  extractAssetClasses(asset: ExoAsset): string[] {
    const instanceClass = asset['exo__Instance_class'] || asset['exo__instance_class'];
    if (!instanceClass) return [];
    
    const classArray = Array.isArray(instanceClass) ? instanceClass : [instanceClass];
    
    return classArray.map(cls => {
      if (typeof cls === 'string') {
        return cls.replace(/[\[\]]/g, '');
      } else if (cls.path) {
        return cls.path.split('/').pop()?.replace('.md', '') || 'unknown';
      }
      return 'unknown';
    });
  }
}