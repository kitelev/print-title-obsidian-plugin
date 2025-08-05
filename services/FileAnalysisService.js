"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAnalysisService = void 0;
class FileAnalysisService {
    constructor(app, settings) {
        this.app = app;
        this.settings = settings;
    }
    /**
     * Update settings reference
     */
    updateSettings(settings) {
        this.settings = settings;
    }
    /**
     * Analyze a file and return detailed metrics
     */
    async analyzeFile(context) {
        const { file } = context;
        try {
            // Get file content
            const content = await this.app.vault.read(file);
            const cache = this.app.metadataCache.getFileCache(file);
            return this.performAnalysis(content, cache);
        }
        catch (error) {
            this.log(`Error analyzing file ${file.path}:`, error);
            return this.getDefaultAnalysis();
        }
    }
    /**
     * Get file statistics for display
     */
    getFileStats(analysis) {
        const stats = [];
        if (analysis.wordCount > 0) {
            stats.push(`${analysis.wordCount} words`);
        }
        if (analysis.linkCount > 0) {
            stats.push(`${analysis.linkCount} links`);
        }
        if (analysis.tagCount > 0) {
            stats.push(`${analysis.tagCount} tags`);
        }
        if (analysis.estimatedReadingTime > 0) {
            stats.push(`${analysis.estimatedReadingTime}min read`);
        }
        if (analysis.hasImages) {
            stats.push('has images');
        }
        stats.push(`${analysis.complexity} complexity`);
        return stats;
    }
    /**
     * Determine if file is substantial enough to show enhanced info
     */
    isSubstantialFile(analysis) {
        return analysis.wordCount > 50 ||
            analysis.linkCount > 3 ||
            analysis.tagCount > 2 ||
            analysis.hasImages;
    }
    performAnalysis(content, cache) {
        var _a, _b, _c, _d;
        // Count words (simple approach)
        const words = content.match(/\b\w+\b/g) || [];
        const wordCount = words.length;
        // Count characters (excluding whitespace)
        const characterCount = content.replace(/\s/g, '').length;
        // Count links
        const linkCount = (((_a = cache === null || cache === void 0 ? void 0 : cache.links) === null || _a === void 0 ? void 0 : _a.length) || 0) + (((_b = cache === null || cache === void 0 ? void 0 : cache.embeds) === null || _b === void 0 ? void 0 : _b.length) || 0);
        // Count tags
        const tagCount = ((_c = cache === null || cache === void 0 ? void 0 : cache.tags) === null || _c === void 0 ? void 0 : _c.length) || 0;
        // Check for images
        const hasImages = !!((_d = cache === null || cache === void 0 ? void 0 : cache.embeds) === null || _d === void 0 ? void 0 : _d.some(embed => embed.link.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)));
        // Estimate reading time (average 250 words per minute)
        const estimatedReadingTime = Math.ceil(wordCount / 250);
        // Determine complexity
        let complexity = 'simple';
        if (wordCount > 500 || linkCount > 10 || tagCount > 5) {
            complexity = 'moderate';
        }
        if (wordCount > 1500 || linkCount > 25 || tagCount > 10) {
            complexity = 'complex';
        }
        return {
            wordCount,
            characterCount,
            linkCount,
            tagCount,
            hasImages,
            estimatedReadingTime,
            complexity
        };
    }
    getDefaultAnalysis() {
        return {
            wordCount: 0,
            characterCount: 0,
            linkCount: 0,
            tagCount: 0,
            hasImages: false,
            estimatedReadingTime: 0,
            complexity: 'simple'
        };
    }
    log(message, ...args) {
        if (this.settings.enableDebugMode) {
            console.log(`[PrintTitle FileAnalysisService] ${message}`, ...args);
        }
    }
}
exports.FileAnalysisService = FileAnalysisService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUFuYWx5c2lzU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlcy9GaWxlQW5hbHlzaXNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWFBLE1BQWEsbUJBQW1CO0lBQy9CLFlBQW9CLEdBQVEsRUFBVSxRQUE0QjtRQUE5QyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7SUFBRyxDQUFDO0lBRXRFOztPQUVHO0lBQ0gsY0FBYyxDQUFDLFFBQTRCO1FBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBb0I7UUFDckMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUV6QixJQUFJLENBQUM7WUFDSixtQkFBbUI7WUFDbkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXhELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbEMsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNILFlBQVksQ0FBQyxRQUFzQjtRQUNsQyxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7UUFFM0IsSUFBSSxRQUFRLENB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QUFHLEVBQUUsSUFBSSxRQUFRLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDekQsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUN4QixDQUFDO1FBRUQsT0FBTztZQUNOLFNBQVM7WUFDVCxjQUFjO1lBQ2QsU0FBUztZQUNULFFBQVE7WUFDUixTQUFTO1lBQ1Qsb0JBQW9CO1lBQ3BCLFVBQVU7U0FDVixDQUFDO0lBQ0gsQ0FBQztJQUVPLGtCQUFrQjtRQUN6QixPQUFPO1lBQ04sU0FBUyxFQUFFLENBQUM7WUFDWixjQUFjLEVBQUUsQ0FBQztZQUNqQixTQUFTLEVBQUUsQ0FBQztZQUNaLFFBQVEsRUFBRSxDQUFDO1lBQ1gsU0FBUyxFQUFFLEtBQUs7WUFDaEIsb0JBQW9CLEVBQUUsQ0FBQztZQUN2QixVQUFVLEVBQUUsUUFBUTtTQUNwQixDQUFDO0lBQ0gsQ0FBQztJQUVPLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQzFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxPQUFPLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3JFLENBQUM7SUFDRixDQUFDO0NBQ0Q7QUFoSUQsa0RBZ0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBURmlsZSwgQ2FjaGVkTWV0YWRhdGEgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBGaWxlQ29udGV4dCwgUHJpbnRUaXRsZVNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVBbmFseXNpcyB7XG5cdHdvcmRDb3VudDogbnVtYmVyO1xuXHRjaGFyYWN0ZXJDb3VudDogbnVtYmVyO1xuXHRsaW5rQ291bnQ6IG51bWJlcjtcblx0dGFnQ291bnQ6IG51bWJlcjtcblx0aGFzSW1hZ2VzOiBib29sZWFuO1xuXHRlc3RpbWF0ZWRSZWFkaW5nVGltZTogbnVtYmVyOyAvLyBpbiBtaW51dGVzXG5cdGNvbXBsZXhpdHk6ICdzaW1wbGUnIHwgJ21vZGVyYXRlJyB8ICdjb21wbGV4Jztcbn1cblxuZXhwb3J0IGNsYXNzIEZpbGVBbmFseXNpc1NlcnZpY2Uge1xuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcDogQXBwLCBwcml2YXRlIHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3MpIHt9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzZXR0aW5ncyByZWZlcmVuY2Vcblx0ICovXG5cdHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3MpOiB2b2lkIHtcblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cdH1cblxuXHQvKipcblx0ICogQW5hbHl6ZSBhIGZpbGUgYW5kIHJldHVybiBkZXRhaWxlZCBtZXRyaWNzXG5cdCAqL1xuXHRhc3luYyBhbmFseXplRmlsZShjb250ZXh0OiBGaWxlQ29udGV4dCk6IFByb21pc2U8RmlsZUFuYWx5c2lzPiB7XG5cdFx0Y29uc3QgeyBmaWxlIH0gPSBjb250ZXh0O1xuXHRcdFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBHZXQgZmlsZSBjb250ZW50XG5cdFx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcblx0XHRcdGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG5cdFx0XHRcblx0XHRcdHJldHVybiB0aGlzLnBlcmZvcm1BbmFseXNpcyhjb250ZW50LCBjYWNoZSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHRoaXMubG9nKGBFcnJvciBhbmFseXppbmcgZmlsZSAke2ZpbGUucGF0aH06YCwgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0RGVmYXVsdEFuYWx5c2lzKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBmaWxlIHN0YXRpc3RpY3MgZm9yIGRpc3BsYXlcblx0ICovXG5cdGdldEZpbGVTdGF0cyhhbmFseXNpczogRmlsZUFuYWx5c2lzKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHN0YXRzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFxuXHRcdGlmIChhbmFseXNpcy53b3JkQ291bnQgPiAwKSB7XG5cdFx0XHRzdGF0cy5wdXNoKGAke2FuYWx5c2lzLndvcmRDb3VudH0gd29yZHNgKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGFuYWx5c2lzLmxpbmtDb3VudCA+IDApIHtcblx0XHRcdHN0YXRzLnB1c2goYCR7YW5hbHlzaXMubGlua0NvdW50fSBsaW5rc2ApO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoYW5hbHlzaXMudGFnQ291bnQgPiAwKSB7XG5cdFx0XHRzdGF0cy5wdXNoKGAke2FuYWx5c2lzLnRhZ0NvdW50fSB0YWdzYCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmIChhbmFseXNpcy5lc3RpbWF0ZWRSZWFkaW5nVGltZSA+IDApIHtcblx0XHRcdHN0YXRzLnB1c2goYCR7YW5hbHlzaXMuZXN0aW1hdGVkUmVhZGluZ1RpbWV9bWluIHJlYWRgKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGFuYWx5c2lzLmhhc0ltYWdlcykge1xuXHRcdFx0c3RhdHMucHVzaCgnaGFzIGltYWdlcycpO1xuXHRcdH1cblx0XHRcblx0XHRzdGF0cy5wdXNoKGAke2FuYWx5c2lzLmNvbXBsZXhpdHl9IGNvbXBsZXhpdHlgKTtcblx0XHRcblx0XHRyZXR1cm4gc3RhdHM7XG5cdH1cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIGlmIGZpbGUgaXMgc3Vic3RhbnRpYWwgZW5vdWdoIHRvIHNob3cgZW5oYW5jZWQgaW5mb1xuXHQgKi9cblx0aXNTdWJzdGFudGlhbEZpbGUoYW5hbHlzaXM6IEZpbGVBbmFseXNpcyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBhbmFseXNpcy53b3JkQ291bnQgPiA1MCB8fCBcblx0XHRcdCAgIGFuYWx5c2lzLmxpbmtDb3VudCA+IDMgfHwgXG5cdFx0XHQgICBhbmFseXNpcy50YWdDb3VudCA+IDIgfHxcblx0XHRcdCAgIGFuYWx5c2lzLmhhc0ltYWdlcztcblx0fVxuXG5cdHByaXZhdGUgcGVyZm9ybUFuYWx5c2lzKGNvbnRlbnQ6IHN0cmluZywgY2FjaGU6IENhY2hlZE1ldGFkYXRhIHwgbnVsbCk6IEZpbGVBbmFseXNpcyB7XG5cdFx0Ly8gQ291bnQgd29yZHMgKHNpbXBsZSBhcHByb2FjaClcblx0XHRjb25zdCB3b3JkcyA9IGNvbnRlbnQubWF0Y2goL1xcYlxcdytcXGIvZykgfHwgW107XG5cdFx0Y29uc3Qgd29yZENvdW50ID0gd29yZHMubGVuZ3RoO1xuXHRcdFxuXHRcdC8vIENvdW50IGNoYXJhY3RlcnMgKGV4Y2x1ZGluZyB3aGl0ZXNwYWNlKVxuXHRcdGNvbnN0IGNoYXJhY3RlckNvdW50ID0gY29udGVudC5yZXBsYWNlKC9cXHMvZywgJycpLmxlbmd0aDtcblx0XHRcblx0XHQvLyBDb3VudCBsaW5rc1xuXHRcdGNvbnN0IGxpbmtDb3VudCA9IChjYWNoZT8ubGlua3M/Lmxlbmd0aCB8fCAwKSArIChjYWNoZT8uZW1iZWRzPy5sZW5ndGggfHwgMCk7XG5cdFx0XG5cdFx0Ly8gQ291bnQgdGFnc1xuXHRcdGNvbnN0IHRhZ0NvdW50ID0gY2FjaGU/LnRhZ3M/Lmxlbmd0aCB8fCAwO1xuXHRcdFxuXHRcdC8vIENoZWNrIGZvciBpbWFnZXNcblx0XHRjb25zdCBoYXNJbWFnZXMgPSAhIShjYWNoZT8uZW1iZWRzPy5zb21lKGVtYmVkID0+IFxuXHRcdFx0ZW1iZWQubGluay5tYXRjaCgvXFwuKHBuZ3xqcGd8anBlZ3xnaWZ8c3ZnfHdlYnApJC9pKVxuXHRcdCkpO1xuXHRcdFxuXHRcdC8vIEVzdGltYXRlIHJlYWRpbmcgdGltZSAoYXZlcmFnZSAyNTAgd29yZHMgcGVyIG1pbnV0ZSlcblx0XHRjb25zdCBlc3RpbWF0ZWRSZWFkaW5nVGltZSA9IE1hdGguY2VpbCh3b3JkQ291bnQgLyAyNTApO1xuXHRcdFxuXHRcdC8vIERldGVybWluZSBjb21wbGV4aXR5XG5cdFx0bGV0IGNvbXBsZXhpdHk6ICdzaW1wbGUnIHwgJ21vZGVyYXRlJyB8ICdjb21wbGV4JyA9ICdzaW1wbGUnO1xuXHRcdGlmICh3b3JkQ291bnQgPiA1MDAgfHwgbGlua0NvdW50ID4gMTAgfHwgdGFnQ291bnQgPiA1KSB7XG5cdFx0XHRjb21wbGV4aXR5ID0gJ21vZGVyYXRlJztcblx0XHR9XG5cdFx0aWYgKHdvcmRDb3VudCA+IDE1MDAgfHwgbGlua0NvdW50ID4gMjUgfHwgdGFnQ291bnQgPiAxMCkge1xuXHRcdFx0Y29tcGxleGl0eSA9ICdjb21wbGV4Jztcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHtcblx0XHRcdHdvcmRDb3VudCxcblx0XHRcdGNoYXJhY3RlckNvdW50LFxuXHRcdFx0bGlua0NvdW50LFxuXHRcdFx0dGFnQ291bnQsXG5cdFx0XHRoYXNJbWFnZXMsXG5cdFx0XHRlc3RpbWF0ZWRSZWFkaW5nVGltZSxcblx0XHRcdGNvbXBsZXhpdHlcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBnZXREZWZhdWx0QW5hbHlzaXMoKTogRmlsZUFuYWx5c2lzIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0d29yZENvdW50OiAwLFxuXHRcdFx0Y2hhcmFjdGVyQ291bnQ6IDAsXG5cdFx0XHRsaW5rQ291bnQ6IDAsXG5cdFx0XHR0YWdDb3VudDogMCxcblx0XHRcdGhhc0ltYWdlczogZmFsc2UsXG5cdFx0XHRlc3RpbWF0ZWRSZWFkaW5nVGltZTogMCxcblx0XHRcdGNvbXBsZXhpdHk6ICdzaW1wbGUnXG5cdFx0fTtcblx0fVxuXG5cdHByaXZhdGUgbG9nKG1lc3NhZ2U6IHN0cmluZywgLi4uYXJnczogYW55W10pOiB2b2lkIHtcblx0XHRpZiAodGhpcy5zZXR0aW5ncy5lbmFibGVEZWJ1Z01vZGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKGBbUHJpbnRUaXRsZSBGaWxlQW5hbHlzaXNTZXJ2aWNlXSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG5cdFx0fVxuXHR9XG59Il19