import { Notice, TFile } from 'obsidian';
import { PrintTitleSettings, FileContext } from '../types';

export class NotificationService {
	constructor(private settings: PrintTitleSettings) {}

	/**
	 * Update settings reference
	 */
	updateSettings(settings: PrintTitleSettings): void {
		this.settings = settings;
	}

	/**
	 * Show title notification with enhanced information
	 */
	showTitleNotification(context: FileContext): void {
		const message = this.buildNotificationMessage(context);
		const notice = new Notice(message, this.settings.notificationDuration);
		
		// Add custom styling to the notice
		this.styleNotice(notice, context);
		
		this.log(`Showed notification: ${message}`);
	}

	/**
	 * Show error notification
	 */
	showError(message: string): void {
		new Notice(`❌ Print Title: ${message}`, 5000);
		this.log(`Error: ${message}`);
	}

	/**
	 * Show success notification
	 */
	showSuccess(message: string): void {
		new Notice(`✅ ${message}`, 2000);
		this.log(`Success: ${message}`);
	}

	/**
	 * Show info notification
	 */
	showInfo(message: string): void {
		new Notice(`ℹ️ ${message}`, 3000);
		this.log(`Info: ${message}`);
	}

	private buildNotificationMessage(context: FileContext): string {
		const { file, frontmatter } = context;
		
		// Build base message
		let message = this.settings.showIcon ? `📄 ${file.basename}` : file.basename;
		
		// Add additional context if available
		const additionalInfo: string[] = [];
		
		// Add tags if present
		if (frontmatter?.tags && Array.isArray(frontmatter.tags)) {
			const tagCount = frontmatter.tags.length;
			if (tagCount > 0) {
				additionalInfo.push(`${tagCount} tag${tagCount > 1 ? 's' : ''}`);
			}
		}
		
		// Add word count estimation (rough)
		if (file.stat?.size) {
			const estimatedWords = Math.ceil(file.stat.size / 6); // rough estimate
			if (estimatedWords > 0) {
				additionalInfo.push(`~${estimatedWords} words`);
			}
		}
		
		// Add creation date
		if (frontmatter?.created || file.stat?.ctime) {
			const date = frontmatter?.created ? new Date(frontmatter.created) : new Date(file.stat.ctime);
			const dateStr = date.toLocaleDateString();
			additionalInfo.push(`Created: ${dateStr}`);
		}
		
		// Append additional info if any
		if (additionalInfo.length > 0) {
			message += `\n${additionalInfo.join(' • ')}`;
		}
		
		return message;
	}

	private styleNotice(notice: Notice, context: FileContext): void {
		// Get the notice element
		const noticeEl = (notice as any).noticeEl;
		if (!noticeEl) return;

		// Add custom classes
		noticeEl.addClass('print-title-notice');
		
		// Add file-specific styling
		if (context.frontmatter?.tags) {
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

	private log(message: string): void {
		if (this.settings.enableDebugMode) {
			console.log(`[PrintTitle NotificationService] ${message}`);
		}
	}
}