"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const obsidian_1 = require("obsidian");
class NotificationService {
    constructor(settings) {
        this.settings = settings;
    }
    /**
     * Update settings reference
     */
    updateSettings(settings) {
        this.settings = settings;
    }
    /**
     * Show title notification with enhanced information
     */
    showTitleNotification(context) {
        const message = this.buildNotificationMessage(context);
        const notice = new obsidian_1.Notice(message, this.settings.notificationDuration);
        // Add custom styling to the notice
        this.styleNotice(notice, context);
        this.log(`Showed notification: ${message}`);
    }
    /**
     * Show error notification
     */
    showError(message) {
        new obsidian_1.Notice(`❌ Print Title: ${message}`, 5000);
        this.log(`Error: ${message}`);
    }
    /**
     * Show success notification
     */
    showSuccess(message) {
        new obsidian_1.Notice(`✅ ${message}`, 2000);
        this.log(`Success: ${message}`);
    }
    /**
     * Show info notification
     */
    showInfo(message) {
        new obsidian_1.Notice(`ℹ️ ${message}`, 3000);
        this.log(`Info: ${message}`);
    }
    buildNotificationMessage(context) {
        var _a, _b;
        const { file, frontmatter } = context;
        // Build base message
        let message = this.settings.showIcon ? `📄 ${file.basename}` : file.basename;
        // Add additional context if available
        const additionalInfo = [];
        // Add tags if present
        if ((frontmatter === null || frontmatter === void 0 ? void 0 : frontmatter.tags) && Array.isArray(frontmatter.tags)) {
            const tagCount = frontmatter.tags.length;
            if (tagCount > 0) {
                additionalInfo.push(`${tagCount} tag${tagCount > 1 ? 's' : ''}`);
            }
        }
        // Add word count estimation (rough)
        if ((_a = file.stat) === null || _a === void 0 ? void 0 : _a.size) {
            const estimatedWords = Math.ceil(file.stat.size / 6); // rough estimate
            if (estimatedWords > 0) {
                additionalInfo.push(`~${estimatedWords} words`);
            }
        }
        // Add creation date
        if ((frontmatter === null || frontmatter === void 0 ? void 0 : frontmatter.created) || ((_b = file.stat) === null || _b === void 0 ? void 0 : _b.ctime)) {
            const date = (frontmatter === null || frontmatter === void 0 ? void 0 : frontmatter.created) ? new Date(frontmatter.created) : new Date(file.stat.ctime);
            const dateStr = date.toLocaleDateString();
            additionalInfo.push(`Created: ${dateStr}`);
        }
        // Append additional info if any
        if (additionalInfo.length > 0) {
            message += `\n${additionalInfo.join(' • ')}`;
        }
        return message;
    }
    styleNotice(notice, context) {
        var _a;
        // Get the notice element
        const noticeEl = notice.noticeEl;
        if (!noticeEl)
            return;
        // Add custom classes
        noticeEl.addClass('print-title-notice');
        // Add file-specific styling
        if ((_a = context.frontmatter) === null || _a === void 0 ? void 0 : _a.tags) {
            noticeEl.addClass('has-tags');
        }
        // Apply custom styling
        noticeEl.style.cssText += `
			border-left: 4px solid var(--interactive-accent);
			padding: 12px 16px;
			border-radius: 6px;
			font-family: var(--font-interface);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		`;
        // Add hover effect
        noticeEl.addEventListener('mouseenter', () => {
            noticeEl.style.transform = 'translateY(-2px)';
            noticeEl.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
        });
        noticeEl.addEventListener('mouseleave', () => {
            noticeEl.style.transform = 'translateY(0)';
            noticeEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
    }
    log(message) {
        if (this.settings.enableDebugMode) {
            console.log(`[PrintTitle NotificationService] ${message}`);
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk5vdGlmaWNhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXlDO0FBR3pDLE1BQWEsbUJBQW1CO0lBQy9CLFlBQW9CLFFBQTRCO1FBQTVCLGFBQVEsR0FBUixRQUFRLENBQW9CO0lBQUcsQ0FBQztJQUVwRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxRQUE0QjtRQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxxQkFBcUIsQ0FBQyxPQUFvQjtRQUN6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFdkUsbUNBQW1DO1FBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxDLElBQUksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxDQUFDLE9BQWU7UUFDeEIsSUFBSSxpQkFBTSxDQUFDLGtCQUFrQixPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxXQUFXLENBQUMsT0FBZTtRQUMxQixJQUFJLGlCQUFNLENBQUMsS0FBSyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7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RUFBRSxDQUFDO1lBQy9CLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELHVCQUF1QjtRQUN2QixRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSTs7Ozs7O0dBTXpCLENBQUM7UUFFRixtQkFBbUI7UUFDbkIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7WUFDNUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUM7WUFDOUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsK0JBQStCLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtZQUM1QyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUM7WUFDM0MsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsZ0NBQWdDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRU8sR0FBRyxDQUFDLE9BQWU7UUFDMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDNUQsQ0FBQztJQUNGLENBQUM7Q0FDRDtBQTlIRCxrREE4SEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb3RpY2UsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgUHJpbnRUaXRsZVNldHRpbmdzLCBGaWxlQ29udGV4dCB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IGNsYXNzIE5vdGlmaWNhdGlvblNlcnZpY2Uge1xuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3MpIHt9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzZXR0aW5ncyByZWZlcmVuY2Vcblx0ICovXG5cdHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzOiBQcmludFRpdGxlU2V0dGluZ3MpOiB2b2lkIHtcblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG5cdH1cblxuXHQvKipcblx0ICogU2hvdyB0aXRsZSBub3RpZmljYXRpb24gd2l0aCBlbmhhbmNlZCBpbmZvcm1hdGlvblxuXHQgKi9cblx0c2hvd1RpdGxlTm90aWZpY2F0aW9uKGNvbnRleHQ6IEZpbGVDb250ZXh0KTogdm9pZCB7XG5cdFx0Y29uc3QgbWVzc2FnZSA9IHRoaXMuYnVpbGROb3RpZmljYXRpb25NZXNzYWdlKGNvbnRleHQpO1xuXHRcdGNvbnN0IG5vdGljZSA9IG5ldyBOb3RpY2UobWVzc2FnZSwgdGhpcy5zZXR0aW5ncy5ub3RpZmljYXRpb25EdXJhdGlvbik7XG5cdFx0XG5cdFx0Ly8gQWRkIGN1c3RvbSBzdHlsaW5nIHRvIHRoZSBub3RpY2Vcblx0XHR0aGlzLnN0eWxlTm90aWNlKG5vdGljZSwgY29udGV4dCk7XG5cdFx0XG5cdFx0dGhpcy5sb2coYFNob3dlZCBub3RpZmljYXRpb246ICR7bWVzc2FnZX1gKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93IGVycm9yIG5vdGlmaWNhdGlvblxuXHQgKi9cblx0c2hvd0Vycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuXHRcdG5ldyBOb3RpY2UoYOKdjCBQcmludCBUaXRsZTogJHttZXNzYWdlfWAsIDUwMDApO1xuXHRcdHRoaXMubG9nKGBFcnJvcjogJHttZXNzYWdlfWApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNob3cgc3VjY2VzcyBub3RpZmljYXRpb25cblx0ICovXG5cdHNob3dTdWNjZXNzKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuXHRcdG5ldyBOb3RpY2UoYOKchSAke21lc3NhZ2V9YCwgMjAwMCk7XG5cdFx0dGhpcy5sb2coYFN1Y2Nlc3M6ICR7bWVzc2FnZX1gKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93IGluZm8gbm90aWZpY2F0aW9uXG5cdCAqL1xuXHRzaG93SW5mbyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRuZXcgTm90aWNlKGDihLnvuI8gJHttZXNzYWdlfWAsIDMwMDApO1xuXHRcdHRoaXMubG9nKGBJbmZvOiAke21lc3NhZ2V9YCk7XG5cdH1cblxuXHRwcml2YXRlIGJ1aWxkTm90aWZpY2F0aW9uTWVzc2FnZShjb250ZXh0OiBGaWxlQ29udGV4dCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgeyBmaWxlLCBmcm9udG1hdHRlciB9ID0gY29udGV4dDtcblx0XHRcblx0XHQvLyBCdWlsZCBiYXNlIG1lc3NhZ2Vcblx0XHRsZXQgbWVzc2FnZSA9IHRoaXMuc2V0dGluZ3Muc2hvd0ljb24gPyBg8J+ThCAke2ZpbGUuYmFzZW5hbWV9YCA6IGZpbGUuYmFzZW5hbWU7XG5cdFx0XG5cdFx0Ly8gQWRkIGFkZGl0aW9uYWwgY29udGV4dCBpZiBhdmFpbGFibGVcblx0XHRjb25zdCBhZGRpdGlvbmFsSW5mbzogc3RyaW5nW10gPSBbXTtcblx0XHRcblx0XHQvLyBBZGQgdGFncyBpZiBwcmVzZW50XG5cdFx0aWYgKGZyb250bWF0dGVyPy50YWdzICYmIEFycmF5LmlzQXJyYXkoZnJvbnRtYXR0ZXIudGFncykpIHtcblx0XHRcdGNvbnN0IHRhZ0NvdW50ID0gZnJvbnRtYXR0ZXIudGFncy5sZW5ndGg7XG5cdFx0XHRpZiAodGFnQ291bnQgPiAwKSB7XG5cdFx0XHRcdGFkZGl0aW9uYWxJbmZvLnB1c2goYCR7dGFnQ291bnR9IHRhZyR7dGFnQ291bnQgPiAxID8gJ3MnIDogJyd9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8vIEFkZCB3b3JkIGNvdW50IGVzdGltYXRpb24gKHJvdWdoKVxuXHRcdGlmIChmaWxlLnN0YXQ/LnNpemUpIHtcblx0XHRcdGNvbnN0IGVzdGltYXRlZFdvcmRzID0gTWF0aC5jZWlsKGZpbGUuc3RhdC5zaXplIC8gNik7IC8vIHJvdWdoIGVzdGltYXRlXG5cdFx0XHRpZiAoZXN0aW1hdGVkV29yZHMgPiAwKSB7XG5cdFx0XHRcdGFkZGl0aW9uYWxJbmZvLnB1c2goYH4ke2VzdGltYXRlZFdvcmRzfSB3b3Jkc2ApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBBZGQgY3JlYXRpb24gZGF0ZVxuXHRcdGlmIChmcm9udG1hdHRlcj8uY3JlYXRlZCB8fCBmaWxlLnN0YXQ/LmN0aW1lKSB7XG5cdFx0XHRjb25zdCBkYXRlID0gZnJvbnRtYXR0ZXI/LmNyZWF0ZWQgPyBuZXcgRGF0ZShmcm9udG1hdHRlci5jcmVhdGVkKSA6IG5ldyBEYXRlKGZpbGUuc3RhdC5jdGltZSk7XG5cdFx0XHRjb25zdCBkYXRlU3RyID0gZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoKTtcblx0XHRcdGFkZGl0aW9uYWxJbmZvLnB1c2goYENyZWF0ZWQ6ICR7ZGF0ZVN0cn1gKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gQXBwZW5kIGFkZGl0aW9uYWwgaW5mbyBpZiBhbnlcblx0XHRpZiAoYWRkaXRpb25hbEluZm8ubGVuZ3RoID4gMCkge1xuXHRcdFx0bWVzc2FnZSArPSBgXFxuJHthZGRpdGlvbmFsSW5mby5qb2luKCcg4oCiICcpfWA7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBtZXNzYWdlO1xuXHR9XG5cblx0cHJpdmF0ZSBzdHlsZU5vdGljZShub3RpY2U6IE5vdGljZSwgY29udGV4dDogRmlsZUNvbnRleHQpOiB2b2lkIHtcblx0XHQvLyBHZXQgdGhlIG5vdGljZSBlbGVtZW50XG5cdFx0Y29uc3Qgbm90aWNlRWwgPSAobm90aWNlIGFzIGFueSkubm90aWNlRWw7XG5cdFx0aWYgKCFub3RpY2VFbCkgcmV0dXJuO1xuXG5cdFx0Ly8gQWRkIGN1c3RvbSBjbGFzc2VzXG5cdFx0bm90aWNlRWwuYWRkQ2xhc3MoJ3ByaW50LXRpdGxlLW5vdGljZScpO1xuXHRcdFxuXHRcdC8vIEFkZCBmaWxlLXNwZWNpZmljIHN0eWxpbmdcblx0XHRpZiAoY29udGV4dC5mcm9udG1hdHRlcj8udGFncykge1xuXHRcdFx0bm90aWNlRWwuYWRkQ2xhc3MoJ2hhcy10YWdzJyk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIEFwcGx5IGN1c3RvbSBzdHlsaW5nXG5cdFx0bm90aWNlRWwuc3R5bGUuY3NzVGV4dCArPSBgXG5cdFx0XHRib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7XG5cdFx0XHRwYWRkaW5nOiAxMnB4IDE2cHg7XG5cdFx0XHRib3JkZXItcmFkaXVzOiA2cHg7XG5cdFx0XHRmb250LWZhbWlseTogdmFyKC0tZm9udC1pbnRlcmZhY2UpO1xuXHRcdFx0Ym94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xuXHRcdGA7XG5cdFx0XG5cdFx0Ly8gQWRkIGhvdmVyIGVmZmVjdFxuXHRcdG5vdGljZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG5cdFx0XHRub3RpY2VFbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgtMnB4KSc7XG5cdFx0XHRub3RpY2VFbC5zdHlsZS5ib3hTaGFkb3cgPSAnMCA2cHggMjBweCByZ2JhKDAsIDAsIDAsIDAuMiknO1xuXHRcdH0pO1xuXHRcdFxuXHRcdG5vdGljZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG5cdFx0XHRub3RpY2VFbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwKSc7XG5cdFx0XHRub3RpY2VFbC5zdHlsZS5ib3hTaGFkb3cgPSAnMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpJztcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgbG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZURlYnVnTW9kZSkge1xuXHRcdFx0Y29uc29sZS5sb2coYFtQcmludFRpdGxlIE5vdGlmaWNhdGlvblNlcnZpY2VdICR7bWVzc2FnZX1gKTtcblx0XHR9XG5cdH1cbn0iXX0=