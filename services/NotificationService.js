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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlcy9Ob3RpZmljYXRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUF5QztBQUd6QyxNQUFhLG1CQUFtQjtJQUMvQixZQUFvQixRQUE0QjtRQUE1QixhQUFRLEdBQVIsUUFBUSxDQUFvQjtJQUFHLENBQUM7SUFFcEQ7O09BRUc7SUFDSCxjQUFjLENBQUMsUUFBNEI7UUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gscUJBQXFCLENBQUMsT0FBb0I7UUFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRXZFLG1DQUFtQztRQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVsQyxJQUFJLENBQUMsR0FBRyxDQUFDLHdCQUF3QixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxPQUFlO1FBQ3hCLElBQUksaUJBQU0sQ0FBQyxrQkFBa0IsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVyxDQUFDLE9BQWU7UUFDMUIsSUFBSSxpQkFBTSxDQUFDLEtBQUssT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLE9BQU8sRUFBRSxDQUFDLENBQUM7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V0FBVywwQ0FBRSxJQUFJLEVBQUUsQ0FBQztZQUMvQixRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCx1QkFBdUI7UUFDdkIsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUk7Ozs7OztHQU16QixDQUFDO1FBRUYsbUJBQW1CO1FBQ25CLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1lBQzVDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO1lBQzlDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLCtCQUErQixDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7WUFDNUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO1lBQzNDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGdDQUFnQyxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVPLEdBQUcsQ0FBQyxPQUFlO1FBQzFCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzVELENBQUM7SUFDRixDQUFDO0NBQ0Q7QUE5SEQsa0RBOEhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90aWNlLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IFByaW50VGl0bGVTZXR0aW5ncywgRmlsZUNvbnRleHQgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBOb3RpZmljYXRpb25TZXJ2aWNlIHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSBzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzKSB7fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc2V0dGluZ3MgcmVmZXJlbmNlXG5cdCAqL1xuXHR1cGRhdGVTZXR0aW5ncyhzZXR0aW5nczogUHJpbnRUaXRsZVNldHRpbmdzKTogdm9pZCB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNob3cgdGl0bGUgbm90aWZpY2F0aW9uIHdpdGggZW5oYW5jZWQgaW5mb3JtYXRpb25cblx0ICovXG5cdHNob3dUaXRsZU5vdGlmaWNhdGlvbihjb250ZXh0OiBGaWxlQ29udGV4dCk6IHZvaWQge1xuXHRcdGNvbnN0IG1lc3NhZ2UgPSB0aGlzLmJ1aWxkTm90aWZpY2F0aW9uTWVzc2FnZShjb250ZXh0KTtcblx0XHRjb25zdCBub3RpY2UgPSBuZXcgTm90aWNlKG1lc3NhZ2UsIHRoaXMuc2V0dGluZ3Mubm90aWZpY2F0aW9uRHVyYXRpb24pO1xuXHRcdFxuXHRcdC8vIEFkZCBjdXN0b20gc3R5bGluZyB0byB0aGUgbm90aWNlXG5cdFx0dGhpcy5zdHlsZU5vdGljZShub3RpY2UsIGNvbnRleHQpO1xuXHRcdFxuXHRcdHRoaXMubG9nKGBTaG93ZWQgbm90aWZpY2F0aW9uOiAke21lc3NhZ2V9YCk7XG5cdH1cblxuXHQvKipcblx0ICogU2hvdyBlcnJvciBub3RpZmljYXRpb25cblx0ICovXG5cdHNob3dFcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRuZXcgTm90aWNlKGDinYwgUHJpbnQgVGl0bGU6ICR7bWVzc2FnZX1gLCA1MDAwKTtcblx0XHR0aGlzLmxvZyhgRXJyb3I6ICR7bWVzc2FnZX1gKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93IHN1Y2Nlc3Mgbm90aWZpY2F0aW9uXG5cdCAqL1xuXHRzaG93U3VjY2VzcyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRuZXcgTm90aWNlKGDinIUgJHttZXNzYWdlfWAsIDIwMDApO1xuXHRcdHRoaXMubG9nKGBTdWNjZXNzOiAke21lc3NhZ2V9YCk7XG5cdH1cblxuXHQvKipcblx0ICogU2hvdyBpbmZvIG5vdGlmaWNhdGlvblxuXHQgKi9cblx0c2hvd0luZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0bmV3IE5vdGljZShg4oS577iPICR7bWVzc2FnZX1gLCAzMDAwKTtcblx0XHR0aGlzLmxvZyhgSW5mbzogJHttZXNzYWdlfWApO1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZE5vdGlmaWNhdGlvbk1lc3NhZ2UoY29udGV4dDogRmlsZUNvbnRleHQpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHsgZmlsZSwgZnJvbnRtYXR0ZXIgfSA9IGNvbnRleHQ7XG5cdFx0XG5cdFx0Ly8gQnVpbGQgYmFzZSBtZXNzYWdlXG5cdFx0bGV0IG1lc3NhZ2UgPSB0aGlzLnNldHRpbmdzLnNob3dJY29uID8gYPCfk4QgJHtmaWxlLmJhc2VuYW1lfWAgOiBmaWxlLmJhc2VuYW1lO1xuXHRcdFxuXHRcdC8vIEFkZCBhZGRpdGlvbmFsIGNvbnRleHQgaWYgYXZhaWxhYmxlXG5cdFx0Y29uc3QgYWRkaXRpb25hbEluZm86IHN0cmluZ1tdID0gW107XG5cdFx0XG5cdFx0Ly8gQWRkIHRhZ3MgaWYgcHJlc2VudFxuXHRcdGlmIChmcm9udG1hdHRlcj8udGFncyAmJiBBcnJheS5pc0FycmF5KGZyb250bWF0dGVyLnRhZ3MpKSB7XG5cdFx0XHRjb25zdCB0YWdDb3VudCA9IGZyb250bWF0dGVyLnRhZ3MubGVuZ3RoO1xuXHRcdFx0aWYgKHRhZ0NvdW50ID4gMCkge1xuXHRcdFx0XHRhZGRpdGlvbmFsSW5mby5wdXNoKGAke3RhZ0NvdW50fSB0YWcke3RhZ0NvdW50ID4gMSA/ICdzJyA6ICcnfWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBBZGQgd29yZCBjb3VudCBlc3RpbWF0aW9uIChyb3VnaClcblx0XHRpZiAoZmlsZS5zdGF0Py5zaXplKSB7XG5cdFx0XHRjb25zdCBlc3RpbWF0ZWRXb3JkcyA9IE1hdGguY2VpbChmaWxlLnN0YXQuc2l6ZSAvIDYpOyAvLyByb3VnaCBlc3RpbWF0ZVxuXHRcdFx0aWYgKGVzdGltYXRlZFdvcmRzID4gMCkge1xuXHRcdFx0XHRhZGRpdGlvbmFsSW5mby5wdXNoKGB+JHtlc3RpbWF0ZWRXb3Jkc30gd29yZHNgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gQWRkIGNyZWF0aW9uIGRhdGVcblx0XHRpZiAoZnJvbnRtYXR0ZXI/LmNyZWF0ZWQgfHwgZmlsZS5zdGF0Py5jdGltZSkge1xuXHRcdFx0Y29uc3QgZGF0ZSA9IGZyb250bWF0dGVyPy5jcmVhdGVkID8gbmV3IERhdGUoZnJvbnRtYXR0ZXIuY3JlYXRlZCkgOiBuZXcgRGF0ZShmaWxlLnN0YXQuY3RpbWUpO1xuXHRcdFx0Y29uc3QgZGF0ZVN0ciA9IGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG5cdFx0XHRhZGRpdGlvbmFsSW5mby5wdXNoKGBDcmVhdGVkOiAke2RhdGVTdHJ9YCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIEFwcGVuZCBhZGRpdGlvbmFsIGluZm8gaWYgYW55XG5cdFx0aWYgKGFkZGl0aW9uYWxJbmZvLmxlbmd0aCA+IDApIHtcblx0XHRcdG1lc3NhZ2UgKz0gYFxcbiR7YWRkaXRpb25hbEluZm8uam9pbignIOKAoiAnKX1gO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fVxuXG5cdHByaXZhdGUgc3R5bGVOb3RpY2Uobm90aWNlOiBOb3RpY2UsIGNvbnRleHQ6IEZpbGVDb250ZXh0KTogdm9pZCB7XG5cdFx0Ly8gR2V0IHRoZSBub3RpY2UgZWxlbWVudFxuXHRcdGNvbnN0IG5vdGljZUVsID0gKG5vdGljZSBhcyBhbnkpLm5vdGljZUVsO1xuXHRcdGlmICghbm90aWNlRWwpIHJldHVybjtcblxuXHRcdC8vIEFkZCBjdXN0b20gY2xhc3Nlc1xuXHRcdG5vdGljZUVsLmFkZENsYXNzKCdwcmludC10aXRsZS1ub3RpY2UnKTtcblx0XHRcblx0XHQvLyBBZGQgZmlsZS1zcGVjaWZpYyBzdHlsaW5nXG5cdFx0aWYgKGNvbnRleHQuZnJvbnRtYXR0ZXI/LnRhZ3MpIHtcblx0XHRcdG5vdGljZUVsLmFkZENsYXNzKCdoYXMtdGFncycpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBBcHBseSBjdXN0b20gc3R5bGluZ1xuXHRcdG5vdGljZUVsLnN0eWxlLmNzc1RleHQgKz0gYFxuXHRcdFx0Ym9yZGVyLWxlZnQ6IDRweCBzb2xpZCB2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpO1xuXHRcdFx0cGFkZGluZzogMTJweCAxNnB4O1xuXHRcdFx0Ym9yZGVyLXJhZGl1czogNnB4O1xuXHRcdFx0Zm9udC1mYW1pbHk6IHZhcigtLWZvbnQtaW50ZXJmYWNlKTtcblx0XHRcdGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcblx0XHRgO1xuXHRcdFxuXHRcdC8vIEFkZCBob3ZlciBlZmZlY3Rcblx0XHRub3RpY2VFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuXHRcdFx0bm90aWNlRWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTJweCknO1xuXHRcdFx0bm90aWNlRWwuc3R5bGUuYm94U2hhZG93ID0gJzAgNnB4IDIwcHggcmdiYSgwLCAwLCAwLCAwLjIpJztcblx0XHR9KTtcblx0XHRcblx0XHRub3RpY2VFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuXHRcdFx0bm90aWNlRWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xuXHRcdFx0bm90aWNlRWwuc3R5bGUuYm94U2hhZG93ID0gJzAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjE1KSc7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5zZXR0aW5ncy5lbmFibGVEZWJ1Z01vZGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKGBbUHJpbnRUaXRsZSBOb3RpZmljYXRpb25TZXJ2aWNlXSAke21lc3NhZ2V9YCk7XG5cdFx0fVxuXHR9XG59Il19