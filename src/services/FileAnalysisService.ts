import { App, TFile, CachedMetadata } from 'obsidian';
import { FileContext, PrintTitleSettings } from '../types';

export interface FileAnalysis {
	wordCount: number;
	characterCount: number;
	linkCount: number;
	tagCount: number;
	hasImages: boolean;
	estimatedReadingTime: number; // in minutes
	complexity: 'simple' | 'moderate' | 'complex';
}

export class FileAnalysisService {
	constructor(private app: App, private settings: PrintTitleSettings) {}

	/**
	 * Update settings reference
	 */
	updateSettings(settings: PrintTitleSettings): void {
		this.settings = settings;
	}

	/**
	 * Analyze a file and return detailed metrics
	 */
	async analyzeFile(context: FileContext): Promise<FileAnalysis> {
		const { file } = context;
		
		try {
			// Get file content
			const content = await this.app.vault.read(file);
			const cache = this.app.metadataCache.getFileCache(file);
			
			return this.performAnalysis(content, cache);
		} catch (error) {
			this.log(`Error analyzing file ${file.path}:`, error);
			return this.getDefaultAnalysis();
		}
	}

	/**
	 * Get file statistics for display
	 */
	getFileStats(analysis: FileAnalysis): string[] {
		const stats: string[] = [];
		
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
	isSubstantialFile(analysis: FileAnalysis): boolean {
		return analysis.wordCount > 50 || 
			   analysis.linkCount > 3 || 
			   analysis.tagCount > 2 ||
			   analysis.hasImages;
	}

	private performAnalysis(content: string, cache: CachedMetadata | null): FileAnalysis {
		// Count words (simple approach)
		const words = content.match(/\b\w+\b/g) || [];
		const wordCount = words.length;
		
		// Count characters (excluding whitespace)
		const characterCount = content.replace(/\s/g, '').length;
		
		// Count links
		const linkCount = (cache?.links?.length || 0) + (cache?.embeds?.length || 0);
		
		// Count tags
		const tagCount = cache?.tags?.length || 0;
		
		// Check for images
		const hasImages = !!(cache?.embeds?.some(embed => 
			embed.link.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
		));
		
		// Estimate reading time (average 250 words per minute)
		const estimatedReadingTime = Math.ceil(wordCount / 250);
		
		// Determine complexity
		let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
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

	private getDefaultAnalysis(): FileAnalysis {
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

	private log(message: string, ...args: any[]): void {
		if (this.settings.enableDebugMode) {
			console.log(`[PrintTitle FileAnalysisService] ${message}`, ...args);
		}
	}
}