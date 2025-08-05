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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUFuYWx5c2lzU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZpbGVBbmFseXNpc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBYUEsTUFBYSxtQkFBbUI7SUFDL0IsWUFBb0IsR0FBUSxFQUFVLFFBQTRCO1FBQTlDLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFvQjtJQUFHLENBQUM7SUFFdEU7O09BRUc7SUFDSCxjQUFjLENBQUMsUUFBNEI7UUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFvQjtRQUNyQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRXpCLElBQUksQ0FBQztZQUNKLG1CQUFtQjtZQUNuQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFeEQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLHdCQUF3QixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEQsT0FBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNsQyxDQUFDO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLFFBQXNCO1FBQ2xDLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUUzQixJQUFJLFFBQVEsQ0FBQyxTQUFTLEdBQUcsQ0FB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QVEsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUN6RCxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQ3hCLENBQUM7UUFFRCxPQUFPO1lBQ04sU0FBUztZQUNULGNBQWM7WUFDZCxTQUFTO1lBQ1QsUUFBUTtZQUNSLFNBQVM7WUFDVCxvQkFBb0I7WUFDcEIsVUFBVTtTQUNWLENBQUM7SUFDSCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3pCLE9BQU87WUFDTixTQUFTLEVBQUUsQ0FBQztZQUNaLGNBQWMsRUFBRSxDQUFDO1lBQ2pCLFNBQVMsRUFBRSxDQUFDO1lBQ1osUUFBUSxFQUFFLENBQUM7WUFDWCxTQUFTLEVBQUUsS0FBSztZQUNoQixvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZCLFVBQVUsRUFBRSxRQUFRO1NBQ3BCLENBQUM7SUFDSCxDQUFDO0lBRU8sR0FBRyxDQUFDLE9BQWUsRUFBRSxHQUFHLElBQVc7UUFDMUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLE9BQU8sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDckUsQ0FBQztJQUNGLENBQUM7Q0FDRDtBQWhJRCxrREFnSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIFRGaWxlLCBDYWNoZWRNZXRhZGF0YSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IEZpbGVDb250ZXh0LCBQcmludFRpdGxlU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUFuYWx5c2lzIHtcblx0d29yZENvdW50OiBudW1iZXI7XG5cdGNoYXJhY3RlckNvdW50OiBudW1iZXI7XG5cdGxpbmtDb3VudDogbnVtYmVyO1xuXHR0YWdDb3VudDogbnVtYmVyO1xuXHRoYXNJbWFnZXM6IGJvb2xlYW47XG5cdGVzdGltYXRlZFJlYWRpbmdUaW1lOiBudW1iZXI7IC8vIGluIG1pbnV0ZXNcblx0Y29tcGxleGl0eTogJ3NpbXBsZScgfCAnbW9kZXJhdGUnIHwgJ2NvbXBsZXgnO1xufVxuXG5leHBvcnQgY2xhc3MgRmlsZUFuYWx5c2lzU2VydmljZSB7XG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwOiBBcHAsIHByaXZhdGUgc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5ncykge31cblxuXHQvKipcblx0ICogVXBkYXRlIHNldHRpbmdzIHJlZmVyZW5jZVxuXHQgKi9cblx0dXBkYXRlU2V0dGluZ3Moc2V0dGluZ3M6IFByaW50VGl0bGVTZXR0aW5ncyk6IHZvaWQge1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcblx0fVxuXG5cdC8qKlxuXHQgKiBBbmFseXplIGEgZmlsZSBhbmQgcmV0dXJuIGRldGFpbGVkIG1ldHJpY3Ncblx0ICovXG5cdGFzeW5jIGFuYWx5emVGaWxlKGNvbnRleHQ6IEZpbGVDb250ZXh0KTogUHJvbWlzZTxGaWxlQW5hbHlzaXM+IHtcblx0XHRjb25zdCB7IGZpbGUgfSA9IGNvbnRleHQ7XG5cdFx0XG5cdFx0dHJ5IHtcblx0XHRcdC8vIEdldCBmaWxlIGNvbnRlbnRcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuXHRcdFx0Y29uc3QgY2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHRoaXMucGVyZm9ybUFuYWx5c2lzKGNvbnRlbnQsIGNhY2hlKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0dGhpcy5sb2coYEVycm9yIGFuYWx5emluZyBmaWxlICR7ZmlsZS5wYXRofTpgLCBlcnJvcik7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXREZWZhdWx0QW5hbHlzaXMoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGZpbGUgc3RhdGlzdGljcyBmb3IgZGlzcGxheVxuXHQgKi9cblx0Z2V0RmlsZVN0YXRzKGFuYWx5c2lzOiBGaWxlQW5hbHlzaXMpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3Qgc3RhdHM6IHN0cmluZ1tdID0gW107XG5cdFx0XG5cdFx0aWYgKGFuYWx5c2lzLndvcmRDb3VudCA+IDApIHtcblx0XHRcdHN0YXRzLnB1c2goYCR7YW5hbHlzaXMud29yZENvdW50fSB3b3Jkc2ApO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoYW5hbHlzaXMubGlua0NvdW50ID4gMCkge1xuXHRcdFx0c3RhdHMucHVzaChgJHthbmFseXNpcy5saW5rQ291bnR9IGxpbmtzYCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmIChhbmFseXNpcy50YWdDb3VudCA+IDApIHtcblx0XHRcdHN0YXRzLnB1c2goYCR7YW5hbHlzaXMudGFnQ291bnR9IHRhZ3NgKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGFuYWx5c2lzLmVzdGltYXRlZFJlYWRpbmdUaW1lID4gMCkge1xuXHRcdFx0c3RhdHMucHVzaChgJHthbmFseXNpcy5lc3RpbWF0ZWRSZWFkaW5nVGltZX1taW4gcmVhZGApO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoYW5hbHlzaXMuaGFzSW1hZ2VzKSB7XG5cdFx0XHRzdGF0cy5wdXNoKCdoYXMgaW1hZ2VzJyk7XG5cdFx0fVxuXHRcdFxuXHRcdHN0YXRzLnB1c2goYCR7YW5hbHlzaXMuY29tcGxleGl0eX0gY29tcGxleGl0eWApO1xuXHRcdFxuXHRcdHJldHVybiBzdGF0cztcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgaWYgZmlsZSBpcyBzdWJzdGFudGlhbCBlbm91Z2ggdG8gc2hvdyBlbmhhbmNlZCBpbmZvXG5cdCAqL1xuXHRpc1N1YnN0YW50aWFsRmlsZShhbmFseXNpczogRmlsZUFuYWx5c2lzKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGFuYWx5c2lzLndvcmRDb3VudCA+IDUwIHx8IFxuXHRcdFx0ICAgYW5hbHlzaXMubGlua0NvdW50ID4gMyB8fCBcblx0XHRcdCAgIGFuYWx5c2lzLnRhZ0NvdW50ID4gMiB8fFxuXHRcdFx0ICAgYW5hbHlzaXMuaGFzSW1hZ2VzO1xuXHR9XG5cblx0cHJpdmF0ZSBwZXJmb3JtQW5hbHlzaXMoY29udGVudDogc3RyaW5nLCBjYWNoZTogQ2FjaGVkTWV0YWRhdGEgfCBudWxsKTogRmlsZUFuYWx5c2lzIHtcblx0XHQvLyBDb3VudCB3b3JkcyAoc2ltcGxlIGFwcHJvYWNoKVxuXHRcdGNvbnN0IHdvcmRzID0gY29udGVudC5tYXRjaCgvXFxiXFx3K1xcYi9nKSB8fCBbXTtcblx0XHRjb25zdCB3b3JkQ291bnQgPSB3b3Jkcy5sZW5ndGg7XG5cdFx0XG5cdFx0Ly8gQ291bnQgY2hhcmFjdGVycyAoZXhjbHVkaW5nIHdoaXRlc3BhY2UpXG5cdFx0Y29uc3QgY2hhcmFjdGVyQ291bnQgPSBjb250ZW50LnJlcGxhY2UoL1xccy9nLCAnJykubGVuZ3RoO1xuXHRcdFxuXHRcdC8vIENvdW50IGxpbmtzXG5cdFx0Y29uc3QgbGlua0NvdW50ID0gKGNhY2hlPy5saW5rcz8ubGVuZ3RoIHx8IDApICsgKGNhY2hlPy5lbWJlZHM/Lmxlbmd0aCB8fCAwKTtcblx0XHRcblx0XHQvLyBDb3VudCB0YWdzXG5cdFx0Y29uc3QgdGFnQ291bnQgPSBjYWNoZT8udGFncz8ubGVuZ3RoIHx8IDA7XG5cdFx0XG5cdFx0Ly8gQ2hlY2sgZm9yIGltYWdlc1xuXHRcdGNvbnN0IGhhc0ltYWdlcyA9ICEhKGNhY2hlPy5lbWJlZHM/LnNvbWUoZW1iZWQgPT4gXG5cdFx0XHRlbWJlZC5saW5rLm1hdGNoKC9cXC4ocG5nfGpwZ3xqcGVnfGdpZnxzdmd8d2VicCkkL2kpXG5cdFx0KSk7XG5cdFx0XG5cdFx0Ly8gRXN0aW1hdGUgcmVhZGluZyB0aW1lIChhdmVyYWdlIDI1MCB3b3JkcyBwZXIgbWludXRlKVxuXHRcdGNvbnN0IGVzdGltYXRlZFJlYWRpbmdUaW1lID0gTWF0aC5jZWlsKHdvcmRDb3VudCAvIDI1MCk7XG5cdFx0XG5cdFx0Ly8gRGV0ZXJtaW5lIGNvbXBsZXhpdHlcblx0XHRsZXQgY29tcGxleGl0eTogJ3NpbXBsZScgfCAnbW9kZXJhdGUnIHwgJ2NvbXBsZXgnID0gJ3NpbXBsZSc7XG5cdFx0aWYgKHdvcmRDb3VudCA+IDUwMCB8fCBsaW5rQ291bnQgPiAxMCB8fCB0YWdDb3VudCA+IDUpIHtcblx0XHRcdGNvbXBsZXhpdHkgPSAnbW9kZXJhdGUnO1xuXHRcdH1cblx0XHRpZiAod29yZENvdW50ID4gMTUwMCB8fCBsaW5rQ291bnQgPiAyNSB8fCB0YWdDb3VudCA+IDEwKSB7XG5cdFx0XHRjb21wbGV4aXR5ID0gJ2NvbXBsZXgnO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4ge1xuXHRcdFx0d29yZENvdW50LFxuXHRcdFx0Y2hhcmFjdGVyQ291bnQsXG5cdFx0XHRsaW5rQ291bnQsXG5cdFx0XHR0YWdDb3VudCxcblx0XHRcdGhhc0ltYWdlcyxcblx0XHRcdGVzdGltYXRlZFJlYWRpbmdUaW1lLFxuXHRcdFx0Y29tcGxleGl0eVxuXHRcdH07XG5cdH1cblxuXHRwcml2YXRlIGdldERlZmF1bHRBbmFseXNpcygpOiBGaWxlQW5hbHlzaXMge1xuXHRcdHJldHVybiB7XG5cdFx0XHR3b3JkQ291bnQ6IDAsXG5cdFx0XHRjaGFyYWN0ZXJDb3VudDogMCxcblx0XHRcdGxpbmtDb3VudDogMCxcblx0XHRcdHRhZ0NvdW50OiAwLFxuXHRcdFx0aGFzSW1hZ2VzOiBmYWxzZSxcblx0XHRcdGVzdGltYXRlZFJlYWRpbmdUaW1lOiAwLFxuXHRcdFx0Y29tcGxleGl0eTogJ3NpbXBsZSdcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSkge1xuXHRcdFx0Y29uc29sZS5sb2coYFtQcmludFRpdGxlIEZpbGVBbmFseXNpc1NlcnZpY2VdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcblx0XHR9XG5cdH1cbn0iXX0=