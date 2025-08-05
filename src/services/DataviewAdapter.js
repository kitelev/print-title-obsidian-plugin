"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataviewAdapter = void 0;
class DataviewAdapter {
    constructor(app) {
        this.app = app;
        this.isReady = false;
        this.readyPromise = null;
        this.initializeDataview();
    }
    async initializeDataview() {
        if (this.readyPromise) {
            return this.readyPromise;
        }
        this.readyPromise = new Promise((resolve) => {
            const checkDataview = () => {
                var _a, _b, _c, _d;
                const dataviewAPI = (_c = (_b = (_a = this.app.plugins) === null || _a === void 0 ? void 0 : _a.plugins) === null || _b === void 0 ? void 0 : _b.dataview) === null || _c === void 0 ? void 0 : _c.api;
                if (dataviewAPI && ((_d = dataviewAPI.index) === null || _d === void 0 ? void 0 : _d.initialized)) {
                    this.isReady = true;
                    resolve();
                }
                else {
                    setTimeout(checkDataview, 100);
                }
            };
            checkDataview();
        });
        return this.readyPromise;
    }
    async waitForIndexReady() {
        await this.initializeDataview();
    }
    get api() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.app.plugins) === null || _a === void 0 ? void 0 : _a.plugins) === null || _b === void 0 ? void 0 : _b.dataview) === null || _c === void 0 ? void 0 : _c.api;
    }
    get name() {
        return 'Dataview';
    }
    /**
     * Query all pages or pages from a specific source
     */
    async queryPages(source) {
        await this.waitForIndexReady();
        const api = this.api;
        if (!api) {
            console.error('[DataviewAdapter] Dataview API not available');
            return [];
        }
        try {
            const pages = source ? api.pages(source) : api.pages();
            return pages.array().map((page) => this.convertDataviewPageToExoAsset(page));
        }
        catch (error) {
            console.error('[DataviewAdapter] Error querying pages:', error);
            return [];
        }
    }
    /**
     * Get a specific page by path or name
     */
    async getPage(pathOrName) {
        await this.waitForIndexReady();
        const api = this.api;
        if (!api) {
            console.error('[DataviewAdapter] Dataview API not available');
            return null;
        }
        try {
            const page = api.page(pathOrName);
            if (!page)
                return null;
            return this.convertDataviewPageToExoAsset(page);
        }
        catch (error) {
            console.error('[DataviewAdapter] Error getting page:', error);
            return null;
        }
    }
    /**
     * Find assets by class
     */
    async findAssetsByClass(assetClass) {
        await this.waitForIndexReady();
        const api = this.api;
        if (!api) {
            console.error('[DataviewAdapter] Dataview API not available');
            return [];
        }
        try {
            const pages = api.pages().where((p) => {
                const instanceClass = p['exo__Instance_class'] || p['exo__instance_class'];
                if (!instanceClass)
                    return false;
                if (Array.isArray(instanceClass)) {
                    return instanceClass.some((cls) => { var _a; return typeof cls === 'string' ? cls.includes(assetClass) : (_a = cls.path) === null || _a === void 0 ? void 0 : _a.includes(assetClass); });
                }
                else if (typeof instanceClass === 'string') {
                    return instanceClass.includes(assetClass);
                }
                else if (instanceClass.path) {
                    return instanceClass.path.includes(assetClass);
                }
                return false;
            });
            return pages.array().map((page) => this.convertDataviewPageToExoAsset(page));
        }
        catch (error) {
            console.error('[DataviewAdapter] Error finding assets by class:', error);
            return [];
        }
    }
    /**
     * Find child areas for a given parent area
     */
    async findChildAreas(parentAreaName) {
        await this.waitForIndexReady();
        const api = this.api;
        if (!api) {
            console.error('[DataviewAdapter] Dataview API not available');
            return [];
        }
        try {
            const pages = api.pages().where((p) => {
                var _a, _b, _c;
                const instanceClass = p['exo__Instance_class'] || p['exo__instance_class'];
                const parent = p['ems__Area_parent'];
                // Check if this is an ems__Area
                const isArea = Array.isArray(instanceClass)
                    ? instanceClass.some((cls) => { var _a; return typeof cls === 'string' ? cls.includes('ems__Area') : (_a = cls.path) === null || _a === void 0 ? void 0 : _a.includes('ems__Area'); })
                    : typeof instanceClass === 'string'
                        ? instanceClass.includes('ems__Area')
                        : (_a = instanceClass === null || instanceClass === void 0 ? void 0 : instanceClass.path) === null || _a === void 0 ? void 0 : _a.includes('ems__Area');
                if (!isArea || !parent)
                    return false;
                // Check if parent matches
                const parentName = typeof parent === 'string'
                    ? parent.replace(/[\[\]]/g, '')
                    : (_c = (_b = parent.path) === null || _b === void 0 ? void 0 : _b.split('/').pop()) === null || _c === void 0 ? void 0 : _c.replace('.md', '');
                return parentName === parentAreaName;
            });
            return pages.array().map((page) => this.convertDataviewPageToExoAsset(page));
        }
        catch (error) {
            console.error('[DataviewAdapter] Error finding child areas:', error);
            return [];
        }
    }
    /**
     * Convert Dataview page object to ExoAsset format
     */
    convertDataviewPageToExoAsset(page) {
        var _a, _b, _c, _d, _e;
        if (!page)
            return null;
        // Start with copying all direct properties
        const asset = {};
        // Copy all properties that don't start with $ (Dataview internal)
        for (const [key, value] of Object.entries(page)) {
            if (!key.startsWith('$')) {
                asset[key] = value;
            }
        }
        // Set file info
        asset.file = {
            path: ((_a = page.file) === null || _a === void 0 ? void 0 : _a.path) || page.$path || page.path,
            name: ((_b = page.file) === null || _b === void 0 ? void 0 : _b.name) || page.$name || page.name || ((_c = page.$path) === null || _c === void 0 ? void 0 : _c.split('/').pop()),
            link: ((_d = page.file) === null || _d === void 0 ? void 0 : _d.link) || page.$link || page.link,
            mtime: ((_e = page.file) === null || _e === void 0 ? void 0 : _e.mtime) || page.$mtime || new Date()
        };
        // Extract frontmatter properties if not already present
        if (page.$frontmatter) {
            for (const [key, value] of Object.entries(page.$frontmatter)) {
                // Only set if not already present from direct properties
                if (!(key in asset)) {
                    // Extract the actual value from Dataview's frontmatter format
                    const actualValue = (value === null || value === void 0 ? void 0 : value.value) !== undefined ? value.value : value;
                    asset[key] = actualValue;
                }
            }
        }
        return asset;
    }
    /**
     * Check if current page is an ems__Area
     */
    isEmsArea(asset) {
        const instanceClass = asset['exo__Instance_class'] || asset['exo__instance_class'];
        if (!instanceClass)
            return false;
        if (Array.isArray(instanceClass)) {
            return instanceClass.some((cls) => { var _a; return typeof cls === 'string' ? cls.includes('ems__Area') : (_a = cls === null || cls === void 0 ? void 0 : cls.path) === null || _a === void 0 ? void 0 : _a.includes('ems__Area'); });
        }
        else if (typeof instanceClass === 'string') {
            return instanceClass.includes('ems__Area');
        }
        else if (instanceClass && typeof instanceClass === 'object' && instanceClass.path) {
            return instanceClass.path.includes('ems__Area');
        }
        return false;
    }
    /**
     * Extract class names from an asset
     */
    extractAssetClasses(asset) {
        const instanceClass = asset['exo__Instance_class'] || asset['exo__instance_class'];
        if (!instanceClass)
            return [];
        const classArray = Array.isArray(instanceClass) ? instanceClass : [instanceClass];
        return classArray.map(cls => {
            var _a;
            if (typeof cls === 'string') {
                return cls.replace(/[\[\]]/g, '');
            }
            else if (cls.path) {
                return ((_a = cls.path.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.md', '')) || 'unknown';
            }
            return 'unknown';
        });
    }
}
exports.DataviewAdapter = DataviewAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YXZpZXdBZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRGF0YXZpZXdBZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLE1BQWEsZUFBZTtJQUkxQixZQUFvQixHQUFRO1FBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUhwQixZQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ2hCLGlCQUFZLEdBQXlCLElBQUksQ0FBQztRQUdoRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRU8sS0FBSyxDQUFDLGtCQUFrQjtRQUM5QixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMxQyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7O2dCQUN6QixNQUFNLFdBQVcsR0FBRyxNQUFBLE1BQUEsTUFBQyxJQUFJLENBQUMsR0FBVyxDQUFDLE9BQU8sMENBQUUsT0FBTywwQ0FBRSxRQUFRLDBDQUFFLEdBQUcsQ0FBQztnQkFDdEUsSUFBSSxXQUFXLEtBQUksTUFBQSxXQUFXLENBQUMsS0FBSywwQ0FBRSxXQUFXLENBQUEsRUFBRSxDQUFDO29CQUNsRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDcEIsT0FBTyxFQUFFLENBQUM7Z0JBQ1osQ0FBQztxQkFBTSxDQUFDO29CQUNOLFVBQVUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDSCxDQUFDLENBQUM7WUFDRixhQUFhLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMzQixDQUFDO0lBRUQsS0FBSyxDQUFDLGlCQUFpQjtRQUNyQixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxJQUFJLEdBQUc7O1FBQ0wsT0FBTyxNQUFBLE1BQUEsTUFBQyxJQUFJLENBQUMsR0FBVyxDQUFDLE9BQU8sMENBQUUsT0FBTywwQ0FBRSxRQUFRLDBDQUFFLEdBQUcsQ0FBQztJQUMzRCxDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFlO1FBQzlCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNyQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7WUFDOUQsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdkQsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMseUNBQXlDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEUsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFrQjtRQUM5QixNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRS9CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFFdkIsT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxVQUFrQjtRQUN4QyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRS9CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUVELElBQUksQ0FBQztZQUNILE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTtnQkFDekMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzNFLElBQUksQ0FBQyxhQUFhO29CQUFFLE9BQU8sS0FBSyxDQUFDO2dCQUVqQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztvQkFDakMsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUUsV0FDckMsT0FBQSxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQUEsR0FBRyxDQUFDLElBQUksMENBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBLEVBQUEsQ0FDcEYsQ0FBQztnQkFDSixDQUFDO3FCQUFNLElBQUksT0FBTyxhQUFhLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQzdDLE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztxQkFBTSxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDOUIsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakQsQ0FBQztnQkFDRCxPQUFPLEtBQUssQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0RBQWtELEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekUsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxjQUFzQjtRQUN6QyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRS9CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUVELElBQUksQ0FBQztZQUNILE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTs7Z0JBQ3pDLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFFckMsZ0NBQWdDO2dCQUNoQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztvQkFDekMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRSxXQUM5QixPQUFBLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBQSxHQUFHLENBQUMsSUFBSSwwQ0FBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUEsRUFBQSxDQUN0RjtvQkFDSCxDQUFDLENBQUMsT0FBTyxhQUFhLEtBQUssUUFBUTt3QkFDakMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO3dCQUNyQyxDQUFDLENBQUMsTUFBQSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsSUFBSSwwQ0FBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRWpELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sS0FBSyxDQUFDO2dCQUVyQywwQkFBMEI7Z0JBQzFCLE1BQU0sVUFBVSxHQUFHLE9BQU8sTUFBTSxLQUFLLFFBQVE7b0JBQzNDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7b0JBQy9CLENBQUMsQ0FBQyxNQUFBLE1BQUEsTUFBTSxDQUFDLElBQUksMENBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsMENBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFdEQsT0FBTyxVQUFVLEtBQUssY0FBYyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsOENBQThDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsNkJBQTZCLENBQUMsSUFBUzs7UUFDckMsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPLElBQVcsQ0FBQztRQUU5QiwyQ0FBMkM7UUFDM0MsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBRXRCLGtFQUFrRTtRQUNsRSxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDckIsQ0FBQztRQUNILENBQUM7UUFFRCxnQkFBZ0I7UUFDaEIsS0FBSyxDQUFDLElBQUksR0FBRztZQUNYLElBQUksRUFBRSxDQUFBLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsSUFBSSxLQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLElBQUk7WUFDaEQsSUFBSSxFQUFFLENBQUEsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxJQUFJLEtBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFJLE1BQUEsSUFBSSxDQUFDLEtBQUssMENBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQTtZQUNoRixJQUFJLEVBQUUsQ0FBQSxNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLElBQUksS0FBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJO1lBQ2hELEtBQUssRUFBRSxDQUFBLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsS0FBSyxLQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUU7U0FDckQsQ0FBQztRQUVGLHdEQUF3RDtRQUN4RCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDN0QseURBQXlEO2dCQUN6RCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDcEIsOERBQThEO29CQUM5RCxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQWEsYUFBYixLQUFLLHVCQUFMLEtBQUssQ0FBVSxLQUFLLE1BQUssU0FBUyxDQUFDLENBQUMsQ0FBRSxLQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQ3ZGLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUM7Z0JBQzNCLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sS0FBaUIsQ0FBQztJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLENBQUMsS0FBZTtRQUN2QixNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNuRixJQUFJLENBQUMsYUFBYTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRWpDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1lBQ2pDLE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFLFdBQ3JDLE9BQUEsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFBLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxJQUFJLDBDQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQSxFQUFBLENBQ3ZGLENBQUM7UUFDSixDQUFDO2FBQU0sSUFBSSxPQUFPLGFBQWEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM3QyxPQUFRLGFBQXdCLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3pELENBQUM7YUFBTSxJQUFJLGFBQWEsSUFBSSxPQUFPLGFBQWEsS0FBSyxRQUFRLElBQUssYUFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3RixPQUFRLGFBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQkFBbUIsQ0FBQyxLQUFlO1FBQ2pDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ25GLElBQUksQ0FBQyxhQUFhO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFOUIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWxGLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTs7WUFDMUIsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwQyxDQUFDO2lCQUFNLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQixPQUFPLENBQUEsTUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsMENBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSSxTQUFTLENBQUM7WUFDcEUsQ0FBQztZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaFBELDBDQWdQQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEV4b0Fzc2V0IH0gZnJvbSAnLi4vdHlwZXMvRXhvVHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgRGF0YXZpZXdBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpc1JlYWR5ID0gZmFsc2U7XG4gIHByaXZhdGUgcmVhZHlQcm9taXNlOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBhcHA6IEFwcCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZURhdGF2aWV3KCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemVEYXRhdmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5yZWFkeVByb21pc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlYWR5UHJvbWlzZTtcbiAgICB9XG5cbiAgICB0aGlzLnJlYWR5UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBjaGVja0RhdGF2aWV3ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhdmlld0FQSSA9ICh0aGlzLmFwcCBhcyBhbnkpLnBsdWdpbnM/LnBsdWdpbnM/LmRhdGF2aWV3Py5hcGk7XG4gICAgICAgIGlmIChkYXRhdmlld0FQSSAmJiBkYXRhdmlld0FQSS5pbmRleD8uaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICB0aGlzLmlzUmVhZHkgPSB0cnVlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrRGF0YXZpZXcsIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjaGVja0RhdGF2aWV3KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5yZWFkeVByb21pc2U7XG4gIH1cblxuICBhc3luYyB3YWl0Rm9ySW5kZXhSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRpYWxpemVEYXRhdmlldygpO1xuICB9XG5cbiAgZ2V0IGFwaSgpIHtcbiAgICByZXR1cm4gKHRoaXMuYXBwIGFzIGFueSkucGx1Z2lucz8ucGx1Z2lucz8uZGF0YXZpZXc/LmFwaTtcbiAgfVxuXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdEYXRhdmlldyc7XG4gIH1cblxuICAvKipcbiAgICogUXVlcnkgYWxsIHBhZ2VzIG9yIHBhZ2VzIGZyb20gYSBzcGVjaWZpYyBzb3VyY2VcbiAgICovXG4gIGFzeW5jIHF1ZXJ5UGFnZXMoc291cmNlPzogc3RyaW5nKTogUHJvbWlzZTxFeG9Bc3NldFtdPiB7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9ySW5kZXhSZWFkeSgpO1xuICAgIFxuICAgIGNvbnN0IGFwaSA9IHRoaXMuYXBpO1xuICAgIGlmICghYXBpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRGF0YXZpZXdBZGFwdGVyXSBEYXRhdmlldyBBUEkgbm90IGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYWdlcyA9IHNvdXJjZSA/IGFwaS5wYWdlcyhzb3VyY2UpIDogYXBpLnBhZ2VzKCk7XG4gICAgICByZXR1cm4gcGFnZXMuYXJyYXkoKS5tYXAoKHBhZ2U6IGFueSkgPT4gdGhpcy5jb252ZXJ0RGF0YXZpZXdQYWdlVG9FeG9Bc3NldChwYWdlKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tEYXRhdmlld0FkYXB0ZXJdIEVycm9yIHF1ZXJ5aW5nIHBhZ2VzOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3BlY2lmaWMgcGFnZSBieSBwYXRoIG9yIG5hbWVcbiAgICovXG4gIGFzeW5jIGdldFBhZ2UocGF0aE9yTmFtZTogc3RyaW5nKTogUHJvbWlzZTxFeG9Bc3NldCB8IG51bGw+IHtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JJbmRleFJlYWR5KCk7XG4gICAgXG4gICAgY29uc3QgYXBpID0gdGhpcy5hcGk7XG4gICAgaWYgKCFhcGkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tEYXRhdmlld0FkYXB0ZXJdIERhdGF2aWV3IEFQSSBub3QgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFnZSA9IGFwaS5wYWdlKHBhdGhPck5hbWUpO1xuICAgICAgaWYgKCFwYWdlKSByZXR1cm4gbnVsbDtcbiAgICAgIFxuICAgICAgcmV0dXJuIHRoaXMuY29udmVydERhdGF2aWV3UGFnZVRvRXhvQXNzZXQocGFnZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tEYXRhdmlld0FkYXB0ZXJdIEVycm9yIGdldHRpbmcgcGFnZTonLCBlcnJvcik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhc3NldHMgYnkgY2xhc3NcbiAgICovXG4gIGFzeW5jIGZpbmRBc3NldHNCeUNsYXNzKGFzc2V0Q2xhc3M6IHN0cmluZyk6IFByb21pc2U8RXhvQXNzZXRbXT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckluZGV4UmVhZHkoKTtcbiAgICBcbiAgICBjb25zdCBhcGkgPSB0aGlzLmFwaTtcbiAgICBpZiAoIWFwaSkge1xuICAgICAgY29uc29sZS5lcnJvcignW0RhdGF2aWV3QWRhcHRlcl0gRGF0YXZpZXcgQVBJIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFnZXMgPSBhcGkucGFnZXMoKS53aGVyZSgocDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlQ2xhc3MgPSBwWydleG9fX0luc3RhbmNlX2NsYXNzJ10gfHwgcFsnZXhvX19pbnN0YW5jZV9jbGFzcyddO1xuICAgICAgICBpZiAoIWluc3RhbmNlQ2xhc3MpIHJldHVybiBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGluc3RhbmNlQ2xhc3MpKSB7XG4gICAgICAgICAgcmV0dXJuIGluc3RhbmNlQ2xhc3Muc29tZSgoY2xzOiBhbnkpID0+IFxuICAgICAgICAgICAgdHlwZW9mIGNscyA9PT0gJ3N0cmluZycgPyBjbHMuaW5jbHVkZXMoYXNzZXRDbGFzcykgOiBjbHMucGF0aD8uaW5jbHVkZXMoYXNzZXRDbGFzcylcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnN0YW5jZUNsYXNzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJldHVybiBpbnN0YW5jZUNsYXNzLmluY2x1ZGVzKGFzc2V0Q2xhc3MpO1xuICAgICAgICB9IGVsc2UgaWYgKGluc3RhbmNlQ2xhc3MucGF0aCkge1xuICAgICAgICAgIHJldHVybiBpbnN0YW5jZUNsYXNzLnBhdGguaW5jbHVkZXMoYXNzZXRDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwYWdlcy5hcnJheSgpLm1hcCgocGFnZTogYW55KSA9PiB0aGlzLmNvbnZlcnREYXRhdmlld1BhZ2VUb0V4b0Fzc2V0KHBhZ2UpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0RhdGF2aWV3QWRhcHRlcl0gRXJyb3IgZmluZGluZyBhc3NldHMgYnkgY2xhc3M6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGNoaWxkIGFyZWFzIGZvciBhIGdpdmVuIHBhcmVudCBhcmVhXG4gICAqL1xuICBhc3luYyBmaW5kQ2hpbGRBcmVhcyhwYXJlbnRBcmVhTmFtZTogc3RyaW5nKTogUHJvbWlzZTxFeG9Bc3NldFtdPiB7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9ySW5kZXhSZWFkeSgpO1xuICAgIFxuICAgIGNvbnN0IGFwaSA9IHRoaXMuYXBpO1xuICAgIGlmICghYXBpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRGF0YXZpZXdBZGFwdGVyXSBEYXRhdmlldyBBUEkgbm90IGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYWdlcyA9IGFwaS5wYWdlcygpLndoZXJlKChwOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VDbGFzcyA9IHBbJ2V4b19fSW5zdGFuY2VfY2xhc3MnXSB8fCBwWydleG9fX2luc3RhbmNlX2NsYXNzJ107XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHBbJ2Vtc19fQXJlYV9wYXJlbnQnXTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gZW1zX19BcmVhXG4gICAgICAgIGNvbnN0IGlzQXJlYSA9IEFycmF5LmlzQXJyYXkoaW5zdGFuY2VDbGFzcykgXG4gICAgICAgICAgPyBpbnN0YW5jZUNsYXNzLnNvbWUoKGNsczogYW55KSA9PiBcbiAgICAgICAgICAgICAgdHlwZW9mIGNscyA9PT0gJ3N0cmluZycgPyBjbHMuaW5jbHVkZXMoJ2Vtc19fQXJlYScpIDogY2xzLnBhdGg/LmluY2x1ZGVzKCdlbXNfX0FyZWEnKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIDogdHlwZW9mIGluc3RhbmNlQ2xhc3MgPT09ICdzdHJpbmcnIFxuICAgICAgICAgICAgPyBpbnN0YW5jZUNsYXNzLmluY2x1ZGVzKCdlbXNfX0FyZWEnKVxuICAgICAgICAgICAgOiBpbnN0YW5jZUNsYXNzPy5wYXRoPy5pbmNsdWRlcygnZW1zX19BcmVhJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWlzQXJlYSB8fCAhcGFyZW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiBwYXJlbnQgbWF0Y2hlc1xuICAgICAgICBjb25zdCBwYXJlbnROYW1lID0gdHlwZW9mIHBhcmVudCA9PT0gJ3N0cmluZycgXG4gICAgICAgICAgPyBwYXJlbnQucmVwbGFjZSgvW1xcW1xcXV0vZywgJycpXG4gICAgICAgICAgOiBwYXJlbnQucGF0aD8uc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLm1kJywgJycpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHBhcmVudE5hbWUgPT09IHBhcmVudEFyZWFOYW1lO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwYWdlcy5hcnJheSgpLm1hcCgocGFnZTogYW55KSA9PiB0aGlzLmNvbnZlcnREYXRhdmlld1BhZ2VUb0V4b0Fzc2V0KHBhZ2UpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0RhdGF2aWV3QWRhcHRlcl0gRXJyb3IgZmluZGluZyBjaGlsZCBhcmVhczonLCBlcnJvcik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgRGF0YXZpZXcgcGFnZSBvYmplY3QgdG8gRXhvQXNzZXQgZm9ybWF0XG4gICAqL1xuICBjb252ZXJ0RGF0YXZpZXdQYWdlVG9FeG9Bc3NldChwYWdlOiBhbnkpOiBFeG9Bc3NldCB7XG4gICAgaWYgKCFwYWdlKSByZXR1cm4gbnVsbCBhcyBhbnk7XG4gICAgXG4gICAgLy8gU3RhcnQgd2l0aCBjb3B5aW5nIGFsbCBkaXJlY3QgcHJvcGVydGllc1xuICAgIGNvbnN0IGFzc2V0OiBhbnkgPSB7fTtcbiAgICBcbiAgICAvLyBDb3B5IGFsbCBwcm9wZXJ0aWVzIHRoYXQgZG9uJ3Qgc3RhcnQgd2l0aCAkIChEYXRhdmlldyBpbnRlcm5hbClcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwYWdlKSkge1xuICAgICAgaWYgKCFrZXkuc3RhcnRzV2l0aCgnJCcpKSB7XG4gICAgICAgIGFzc2V0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gU2V0IGZpbGUgaW5mb1xuICAgIGFzc2V0LmZpbGUgPSB7XG4gICAgICBwYXRoOiBwYWdlLmZpbGU/LnBhdGggfHwgcGFnZS4kcGF0aCB8fCBwYWdlLnBhdGgsXG4gICAgICBuYW1lOiBwYWdlLmZpbGU/Lm5hbWUgfHwgcGFnZS4kbmFtZSB8fCBwYWdlLm5hbWUgfHwgcGFnZS4kcGF0aD8uc3BsaXQoJy8nKS5wb3AoKSxcbiAgICAgIGxpbms6IHBhZ2UuZmlsZT8ubGluayB8fCBwYWdlLiRsaW5rIHx8IHBhZ2UubGluayxcbiAgICAgIG10aW1lOiBwYWdlLmZpbGU/Lm10aW1lIHx8IHBhZ2UuJG10aW1lIHx8IG5ldyBEYXRlKClcbiAgICB9O1xuICAgIFxuICAgIC8vIEV4dHJhY3QgZnJvbnRtYXR0ZXIgcHJvcGVydGllcyBpZiBub3QgYWxyZWFkeSBwcmVzZW50XG4gICAgaWYgKHBhZ2UuJGZyb250bWF0dGVyKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwYWdlLiRmcm9udG1hdHRlcikpIHtcbiAgICAgICAgLy8gT25seSBzZXQgaWYgbm90IGFscmVhZHkgcHJlc2VudCBmcm9tIGRpcmVjdCBwcm9wZXJ0aWVzXG4gICAgICAgIGlmICghKGtleSBpbiBhc3NldCkpIHtcbiAgICAgICAgICAvLyBFeHRyYWN0IHRoZSBhY3R1YWwgdmFsdWUgZnJvbSBEYXRhdmlldydzIGZyb250bWF0dGVyIGZvcm1hdFxuICAgICAgICAgIGNvbnN0IGFjdHVhbFZhbHVlID0gKHZhbHVlIGFzIGFueSk/LnZhbHVlICE9PSB1bmRlZmluZWQgPyAodmFsdWUgYXMgYW55KS52YWx1ZSA6IHZhbHVlO1xuICAgICAgICAgIGFzc2V0W2tleV0gPSBhY3R1YWxWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYXNzZXQgYXMgRXhvQXNzZXQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgY3VycmVudCBwYWdlIGlzIGFuIGVtc19fQXJlYVxuICAgKi9cbiAgaXNFbXNBcmVhKGFzc2V0OiBFeG9Bc3NldCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGluc3RhbmNlQ2xhc3MgPSBhc3NldFsnZXhvX19JbnN0YW5jZV9jbGFzcyddIHx8IGFzc2V0WydleG9fX2luc3RhbmNlX2NsYXNzJ107XG4gICAgaWYgKCFpbnN0YW5jZUNsYXNzKSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5zdGFuY2VDbGFzcykpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZUNsYXNzLnNvbWUoKGNsczogYW55KSA9PiBcbiAgICAgICAgdHlwZW9mIGNscyA9PT0gJ3N0cmluZycgPyBjbHMuaW5jbHVkZXMoJ2Vtc19fQXJlYScpIDogY2xzPy5wYXRoPy5pbmNsdWRlcygnZW1zX19BcmVhJylcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5zdGFuY2VDbGFzcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAoaW5zdGFuY2VDbGFzcyBhcyBzdHJpbmcpLmluY2x1ZGVzKCdlbXNfX0FyZWEnKTtcbiAgICB9IGVsc2UgaWYgKGluc3RhbmNlQ2xhc3MgJiYgdHlwZW9mIGluc3RhbmNlQ2xhc3MgPT09ICdvYmplY3QnICYmIChpbnN0YW5jZUNsYXNzIGFzIGFueSkucGF0aCkge1xuICAgICAgcmV0dXJuIChpbnN0YW5jZUNsYXNzIGFzIGFueSkucGF0aC5pbmNsdWRlcygnZW1zX19BcmVhJyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IGNsYXNzIG5hbWVzIGZyb20gYW4gYXNzZXRcbiAgICovXG4gIGV4dHJhY3RBc3NldENsYXNzZXMoYXNzZXQ6IEV4b0Fzc2V0KTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGluc3RhbmNlQ2xhc3MgPSBhc3NldFsnZXhvX19JbnN0YW5jZV9jbGFzcyddIHx8IGFzc2V0WydleG9fX2luc3RhbmNlX2NsYXNzJ107XG4gICAgaWYgKCFpbnN0YW5jZUNsYXNzKSByZXR1cm4gW107XG4gICAgXG4gICAgY29uc3QgY2xhc3NBcnJheSA9IEFycmF5LmlzQXJyYXkoaW5zdGFuY2VDbGFzcykgPyBpbnN0YW5jZUNsYXNzIDogW2luc3RhbmNlQ2xhc3NdO1xuICAgIFxuICAgIHJldHVybiBjbGFzc0FycmF5Lm1hcChjbHMgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBjbHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBjbHMucmVwbGFjZSgvW1xcW1xcXV0vZywgJycpO1xuICAgICAgfSBlbHNlIGlmIChjbHMucGF0aCkge1xuICAgICAgICByZXR1cm4gY2xzLnBhdGguc3BsaXQoJy8nKS5wb3AoKT8ucmVwbGFjZSgnLm1kJywgJycpIHx8ICd1bmtub3duJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAndW5rbm93bic7XG4gICAgfSk7XG4gIH1cbn0iXX0=