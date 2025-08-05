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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YXZpZXdBZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZpY2VzL0RhdGF2aWV3QWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxNQUFhLGVBQWU7SUFJMUIsWUFBb0IsR0FBUTtRQUFSLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFIcEIsWUFBTyxHQUFHLEtBQUssQ0FBQztRQUNoQixpQkFBWSxHQUF5QixJQUFJLENBQUM7UUFHaEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0I7UUFDOUIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDMUMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFOztnQkFDekIsTUFBTSxXQUFXLEdBQUcsTUFBQSxNQUFBLE1BQUMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxPQUFPLDBDQUFFLE9BQU8sMENBQUUsUUFBUSwwQ0FBRSxHQUFHLENBQUM7Z0JBQ3RFLElBQUksV0FBVyxLQUFJLE1BQUEsV0FBVyxDQUFDLEtBQUssMENBQUUsV0FBVyxDQUFBLEVBQUUsQ0FBQztvQkFDbEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7b0JBQ3BCLE9BQU8sRUFBRSxDQUFDO2dCQUNaLENBQUM7cUJBQU0sQ0FBQztvQkFDTixVQUFVLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDO1lBQ0YsYUFBYSxFQUFFLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxpQkFBaUI7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QUFFLENBQUM7Z0JBQzVCLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEMsQ0FBQztpQkFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxDQUFBLE1BQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLDBDQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUksU0FBUyxDQUFDO1lBQ3BFLENBQUM7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWhQRCwwQ0FnUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBFeG9Bc3NldCB9IGZyb20gJy4uL3R5cGVzL0V4b1R5cGVzJztcblxuZXhwb3J0IGNsYXNzIERhdGF2aWV3QWRhcHRlciB7XG4gIHByaXZhdGUgaXNSZWFkeSA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWR5UHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwOiBBcHApIHtcbiAgICB0aGlzLmluaXRpYWxpemVEYXRhdmlldygpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplRGF0YXZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMucmVhZHlQcm9taXNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWFkeVByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5yZWFkeVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgY2hlY2tEYXRhdmlldyA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YXZpZXdBUEkgPSAodGhpcy5hcHAgYXMgYW55KS5wbHVnaW5zPy5wbHVnaW5zPy5kYXRhdmlldz8uYXBpO1xuICAgICAgICBpZiAoZGF0YXZpZXdBUEkgJiYgZGF0YXZpZXdBUEkuaW5kZXg/LmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgdGhpcy5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0VGltZW91dChjaGVja0RhdGF2aWV3LCAxMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hlY2tEYXRhdmlldygpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMucmVhZHlQcm9taXNlO1xuICB9XG5cbiAgYXN5bmMgd2FpdEZvckluZGV4UmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5pbml0aWFsaXplRGF0YXZpZXcoKTtcbiAgfVxuXG4gIGdldCBhcGkoKSB7XG4gICAgcmV0dXJuICh0aGlzLmFwcCBhcyBhbnkpLnBsdWdpbnM/LnBsdWdpbnM/LmRhdGF2aWV3Py5hcGk7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnRGF0YXZpZXcnO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXJ5IGFsbCBwYWdlcyBvciBwYWdlcyBmcm9tIGEgc3BlY2lmaWMgc291cmNlXG4gICAqL1xuICBhc3luYyBxdWVyeVBhZ2VzKHNvdXJjZT86IHN0cmluZyk6IFByb21pc2U8RXhvQXNzZXRbXT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckluZGV4UmVhZHkoKTtcbiAgICBcbiAgICBjb25zdCBhcGkgPSB0aGlzLmFwaTtcbiAgICBpZiAoIWFwaSkge1xuICAgICAgY29uc29sZS5lcnJvcignW0RhdGF2aWV3QWRhcHRlcl0gRGF0YXZpZXcgQVBJIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFnZXMgPSBzb3VyY2UgPyBhcGkucGFnZXMoc291cmNlKSA6IGFwaS5wYWdlcygpO1xuICAgICAgcmV0dXJuIHBhZ2VzLmFycmF5KCkubWFwKChwYWdlOiBhbnkpID0+IHRoaXMuY29udmVydERhdGF2aWV3UGFnZVRvRXhvQXNzZXQocGFnZSkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRGF0YXZpZXdBZGFwdGVyXSBFcnJvciBxdWVyeWluZyBwYWdlczonLCBlcnJvcik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNwZWNpZmljIHBhZ2UgYnkgcGF0aCBvciBuYW1lXG4gICAqL1xuICBhc3luYyBnZXRQYWdlKHBhdGhPck5hbWU6IHN0cmluZyk6IFByb21pc2U8RXhvQXNzZXQgfCBudWxsPiB7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9ySW5kZXhSZWFkeSgpO1xuICAgIFxuICAgIGNvbnN0IGFwaSA9IHRoaXMuYXBpO1xuICAgIGlmICghYXBpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRGF0YXZpZXdBZGFwdGVyXSBEYXRhdmlldyBBUEkgbm90IGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhZ2UgPSBhcGkucGFnZShwYXRoT3JOYW1lKTtcbiAgICAgIGlmICghcGFnZSkgcmV0dXJuIG51bGw7XG4gICAgICBcbiAgICAgIHJldHVybiB0aGlzLmNvbnZlcnREYXRhdmlld1BhZ2VUb0V4b0Fzc2V0KHBhZ2UpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRGF0YXZpZXdBZGFwdGVyXSBFcnJvciBnZXR0aW5nIHBhZ2U6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYXNzZXRzIGJ5IGNsYXNzXG4gICAqL1xuICBhc3luYyBmaW5kQXNzZXRzQnlDbGFzcyhhc3NldENsYXNzOiBzdHJpbmcpOiBQcm9taXNlPEV4b0Fzc2V0W10+IHtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JJbmRleFJlYWR5KCk7XG4gICAgXG4gICAgY29uc3QgYXBpID0gdGhpcy5hcGk7XG4gICAgaWYgKCFhcGkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tEYXRhdmlld0FkYXB0ZXJdIERhdGF2aWV3IEFQSSBub3QgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhZ2VzID0gYXBpLnBhZ2VzKCkud2hlcmUoKHA6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBpbnN0YW5jZUNsYXNzID0gcFsnZXhvX19JbnN0YW5jZV9jbGFzcyddIHx8IHBbJ2V4b19faW5zdGFuY2VfY2xhc3MnXTtcbiAgICAgICAgaWYgKCFpbnN0YW5jZUNsYXNzKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnN0YW5jZUNsYXNzKSkge1xuICAgICAgICAgIHJldHVybiBpbnN0YW5jZUNsYXNzLnNvbWUoKGNsczogYW55KSA9PiBcbiAgICAgICAgICAgIHR5cGVvZiBjbHMgPT09ICdzdHJpbmcnID8gY2xzLmluY2x1ZGVzKGFzc2V0Q2xhc3MpIDogY2xzLnBhdGg/LmluY2x1ZGVzKGFzc2V0Q2xhc3MpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5zdGFuY2VDbGFzcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2VDbGFzcy5pbmNsdWRlcyhhc3NldENsYXNzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnN0YW5jZUNsYXNzLnBhdGgpIHtcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2VDbGFzcy5wYXRoLmluY2x1ZGVzKGFzc2V0Q2xhc3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcGFnZXMuYXJyYXkoKS5tYXAoKHBhZ2U6IGFueSkgPT4gdGhpcy5jb252ZXJ0RGF0YXZpZXdQYWdlVG9FeG9Bc3NldChwYWdlKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tEYXRhdmlld0FkYXB0ZXJdIEVycm9yIGZpbmRpbmcgYXNzZXRzIGJ5IGNsYXNzOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZCBjaGlsZCBhcmVhcyBmb3IgYSBnaXZlbiBwYXJlbnQgYXJlYVxuICAgKi9cbiAgYXN5bmMgZmluZENoaWxkQXJlYXMocGFyZW50QXJlYU5hbWU6IHN0cmluZyk6IFByb21pc2U8RXhvQXNzZXRbXT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckluZGV4UmVhZHkoKTtcbiAgICBcbiAgICBjb25zdCBhcGkgPSB0aGlzLmFwaTtcbiAgICBpZiAoIWFwaSkge1xuICAgICAgY29uc29sZS5lcnJvcignW0RhdGF2aWV3QWRhcHRlcl0gRGF0YXZpZXcgQVBJIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFnZXMgPSBhcGkucGFnZXMoKS53aGVyZSgocDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlQ2xhc3MgPSBwWydleG9fX0luc3RhbmNlX2NsYXNzJ10gfHwgcFsnZXhvX19pbnN0YW5jZV9jbGFzcyddO1xuICAgICAgICBjb25zdCBwYXJlbnQgPSBwWydlbXNfX0FyZWFfcGFyZW50J107XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGFuIGVtc19fQXJlYVxuICAgICAgICBjb25zdCBpc0FyZWEgPSBBcnJheS5pc0FycmF5KGluc3RhbmNlQ2xhc3MpIFxuICAgICAgICAgID8gaW5zdGFuY2VDbGFzcy5zb21lKChjbHM6IGFueSkgPT4gXG4gICAgICAgICAgICAgIHR5cGVvZiBjbHMgPT09ICdzdHJpbmcnID8gY2xzLmluY2x1ZGVzKCdlbXNfX0FyZWEnKSA6IGNscy5wYXRoPy5pbmNsdWRlcygnZW1zX19BcmVhJylcbiAgICAgICAgICAgIClcbiAgICAgICAgICA6IHR5cGVvZiBpbnN0YW5jZUNsYXNzID09PSAnc3RyaW5nJyBcbiAgICAgICAgICAgID8gaW5zdGFuY2VDbGFzcy5pbmNsdWRlcygnZW1zX19BcmVhJylcbiAgICAgICAgICAgIDogaW5zdGFuY2VDbGFzcz8ucGF0aD8uaW5jbHVkZXMoJ2Vtc19fQXJlYScpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFpc0FyZWEgfHwgIXBhcmVudCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgaWYgcGFyZW50IG1hdGNoZXNcbiAgICAgICAgY29uc3QgcGFyZW50TmFtZSA9IHR5cGVvZiBwYXJlbnQgPT09ICdzdHJpbmcnIFxuICAgICAgICAgID8gcGFyZW50LnJlcGxhY2UoL1tcXFtcXF1dL2csICcnKVxuICAgICAgICAgIDogcGFyZW50LnBhdGg/LnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5tZCcsICcnKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBwYXJlbnROYW1lID09PSBwYXJlbnRBcmVhTmFtZTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcGFnZXMuYXJyYXkoKS5tYXAoKHBhZ2U6IGFueSkgPT4gdGhpcy5jb252ZXJ0RGF0YXZpZXdQYWdlVG9FeG9Bc3NldChwYWdlKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tEYXRhdmlld0FkYXB0ZXJdIEVycm9yIGZpbmRpbmcgY2hpbGQgYXJlYXM6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IERhdGF2aWV3IHBhZ2Ugb2JqZWN0IHRvIEV4b0Fzc2V0IGZvcm1hdFxuICAgKi9cbiAgY29udmVydERhdGF2aWV3UGFnZVRvRXhvQXNzZXQocGFnZTogYW55KTogRXhvQXNzZXQge1xuICAgIGlmICghcGFnZSkgcmV0dXJuIG51bGwgYXMgYW55O1xuICAgIFxuICAgIC8vIFN0YXJ0IHdpdGggY29weWluZyBhbGwgZGlyZWN0IHByb3BlcnRpZXNcbiAgICBjb25zdCBhc3NldDogYW55ID0ge307XG4gICAgXG4gICAgLy8gQ29weSBhbGwgcHJvcGVydGllcyB0aGF0IGRvbid0IHN0YXJ0IHdpdGggJCAoRGF0YXZpZXcgaW50ZXJuYWwpXG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFnZSkpIHtcbiAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJyQnKSkge1xuICAgICAgICBhc3NldFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFNldCBmaWxlIGluZm9cbiAgICBhc3NldC5maWxlID0ge1xuICAgICAgcGF0aDogcGFnZS5maWxlPy5wYXRoIHx8IHBhZ2UuJHBhdGggfHwgcGFnZS5wYXRoLFxuICAgICAgbmFtZTogcGFnZS5maWxlPy5uYW1lIHx8IHBhZ2UuJG5hbWUgfHwgcGFnZS5uYW1lIHx8IHBhZ2UuJHBhdGg/LnNwbGl0KCcvJykucG9wKCksXG4gICAgICBsaW5rOiBwYWdlLmZpbGU/LmxpbmsgfHwgcGFnZS4kbGluayB8fCBwYWdlLmxpbmssXG4gICAgICBtdGltZTogcGFnZS5maWxlPy5tdGltZSB8fCBwYWdlLiRtdGltZSB8fCBuZXcgRGF0ZSgpXG4gICAgfTtcbiAgICBcbiAgICAvLyBFeHRyYWN0IGZyb250bWF0dGVyIHByb3BlcnRpZXMgaWYgbm90IGFscmVhZHkgcHJlc2VudFxuICAgIGlmIChwYWdlLiRmcm9udG1hdHRlcikge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFnZS4kZnJvbnRtYXR0ZXIpKSB7XG4gICAgICAgIC8vIE9ubHkgc2V0IGlmIG5vdCBhbHJlYWR5IHByZXNlbnQgZnJvbSBkaXJlY3QgcHJvcGVydGllc1xuICAgICAgICBpZiAoIShrZXkgaW4gYXNzZXQpKSB7XG4gICAgICAgICAgLy8gRXh0cmFjdCB0aGUgYWN0dWFsIHZhbHVlIGZyb20gRGF0YXZpZXcncyBmcm9udG1hdHRlciBmb3JtYXRcbiAgICAgICAgICBjb25zdCBhY3R1YWxWYWx1ZSA9ICh2YWx1ZSBhcyBhbnkpPy52YWx1ZSAhPT0gdW5kZWZpbmVkID8gKHZhbHVlIGFzIGFueSkudmFsdWUgOiB2YWx1ZTtcbiAgICAgICAgICBhc3NldFtrZXldID0gYWN0dWFsVmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGFzc2V0IGFzIEV4b0Fzc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGN1cnJlbnQgcGFnZSBpcyBhbiBlbXNfX0FyZWFcbiAgICovXG4gIGlzRW1zQXJlYShhc3NldDogRXhvQXNzZXQpOiBib29sZWFuIHtcbiAgICBjb25zdCBpbnN0YW5jZUNsYXNzID0gYXNzZXRbJ2V4b19fSW5zdGFuY2VfY2xhc3MnXSB8fCBhc3NldFsnZXhvX19pbnN0YW5jZV9jbGFzcyddO1xuICAgIGlmICghaW5zdGFuY2VDbGFzcykgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIGlmIChBcnJheS5pc0FycmF5KGluc3RhbmNlQ2xhc3MpKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2VDbGFzcy5zb21lKChjbHM6IGFueSkgPT4gXG4gICAgICAgIHR5cGVvZiBjbHMgPT09ICdzdHJpbmcnID8gY2xzLmluY2x1ZGVzKCdlbXNfX0FyZWEnKSA6IGNscz8ucGF0aD8uaW5jbHVkZXMoJ2Vtc19fQXJlYScpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGluc3RhbmNlQ2xhc3MgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gKGluc3RhbmNlQ2xhc3MgYXMgc3RyaW5nKS5pbmNsdWRlcygnZW1zX19BcmVhJyk7XG4gICAgfSBlbHNlIGlmIChpbnN0YW5jZUNsYXNzICYmIHR5cGVvZiBpbnN0YW5jZUNsYXNzID09PSAnb2JqZWN0JyAmJiAoaW5zdGFuY2VDbGFzcyBhcyBhbnkpLnBhdGgpIHtcbiAgICAgIHJldHVybiAoaW5zdGFuY2VDbGFzcyBhcyBhbnkpLnBhdGguaW5jbHVkZXMoJ2Vtc19fQXJlYScpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBjbGFzcyBuYW1lcyBmcm9tIGFuIGFzc2V0XG4gICAqL1xuICBleHRyYWN0QXNzZXRDbGFzc2VzKGFzc2V0OiBFeG9Bc3NldCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBpbnN0YW5jZUNsYXNzID0gYXNzZXRbJ2V4b19fSW5zdGFuY2VfY2xhc3MnXSB8fCBhc3NldFsnZXhvX19pbnN0YW5jZV9jbGFzcyddO1xuICAgIGlmICghaW5zdGFuY2VDbGFzcykgcmV0dXJuIFtdO1xuICAgIFxuICAgIGNvbnN0IGNsYXNzQXJyYXkgPSBBcnJheS5pc0FycmF5KGluc3RhbmNlQ2xhc3MpID8gaW5zdGFuY2VDbGFzcyA6IFtpbnN0YW5jZUNsYXNzXTtcbiAgICBcbiAgICByZXR1cm4gY2xhc3NBcnJheS5tYXAoY2xzID0+IHtcbiAgICAgIGlmICh0eXBlb2YgY2xzID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gY2xzLnJlcGxhY2UoL1tcXFtcXF1dL2csICcnKTtcbiAgICAgIH0gZWxzZSBpZiAoY2xzLnBhdGgpIHtcbiAgICAgICAgcmV0dXJuIGNscy5wYXRoLnNwbGl0KCcvJykucG9wKCk/LnJlcGxhY2UoJy5tZCcsICcnKSB8fCAndW5rbm93bic7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3Vua25vd24nO1xuICAgIH0pO1xuICB9XG59Il19