"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PrintTitlePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  buttonText: "Print Title",
  buttonPosition: "after-frontmatter",
  showIcon: true,
  buttonIcon: "\u{1F4C4}",
  enableDebugMode: false,
  notificationDuration: 3e3,
  customCSS: "",
  showEnhancedInfo: true,
  animateButton: true,
  showFileStats: true
};

// src/services/ButtonService.ts
var ButtonService = class {
  constructor(app, settings, notificationService, fileAnalysisService, areaCreationService, dataviewAdapter) {
    this.app = app;
    this.settings = settings;
    this.notificationService = notificationService;
    this.fileAnalysisService = fileAnalysisService;
    this.areaCreationService = areaCreationService;
    this.dataviewAdapter = dataviewAdapter;
    this.buttonMap = /* @__PURE__ */ new WeakMap();
  }
  /**
   * Update settings reference
   */
  updateSettings(settings) {
    this.settings = settings;
  }
  /**
   * Add button to a specific view
   */
  addButtonToView(view) {
    return __async(this, null, function* () {
      if (!view || !view.file) {
        this.log("No valid view or file found");
        return;
      }
      const fileContext = this.createFileContext(view);
      this.log(`Adding button to view: ${fileContext.fileName}`);
      const contentEl = view.contentEl;
      if (this.buttonExists(contentEl)) {
        this.log("Button already exists in this view");
        return;
      }
      this.removeExistingButtons(contentEl);
      const isEmsArea = yield this.isEmsAreaFile(view);
      const buttonConfig = this.createButtonConfig(isEmsArea);
      const button = this.createButton(buttonConfig, fileContext, isEmsArea);
      this.insertButton(contentEl, button, buttonConfig.position);
      this.buttonMap.set(contentEl, button);
      this.log("Button successfully added");
    });
  }
  /**
   * Remove all buttons from the current view
   */
  removeButtonsFromView(view) {
    if (!view) return;
    const contentEl = view.contentEl;
    this.removeExistingButtons(contentEl);
    this.buttonMap.delete(contentEl);
  }
  /**
   * Clean up all buttons
   */
  cleanup() {
    const containers = document.querySelectorAll(".print-title-container");
    this.log(`Removing ${containers.length} button containers`);
    containers.forEach((el) => el.remove());
    this.buttonMap = /* @__PURE__ */ new WeakMap();
  }
  createFileContext(view) {
    const cache = view.app.metadataCache.getFileCache(view.file);
    return {
      file: view.file,
      fileName: view.file.name,
      filePath: view.file.path,
      frontmatter: cache == null ? void 0 : cache.frontmatter
    };
  }
  createButtonConfig(isEmsArea = false) {
    let displayText;
    let buttonClass;
    if (isEmsArea) {
      displayText = this.settings.showIcon ? `\u{1F3D7}\uFE0F Create Child Area` : "Create Child Area";
      buttonClass = "print-title-button area-create-button";
    } else {
      displayText = this.settings.showIcon ? `${this.settings.buttonIcon} ${this.settings.buttonText}`.trim() : this.settings.buttonText;
      buttonClass = "print-title-button";
    }
    return {
      text: displayText,
      icon: this.settings.showIcon ? this.settings.buttonIcon : void 0,
      position: this.settings.buttonPosition,
      className: buttonClass
    };
  }
  buttonExists(contentEl) {
    const existingButton = this.buttonMap.get(contentEl);
    return !!(existingButton && contentEl.contains(existingButton));
  }
  removeExistingButtons(contentEl) {
    const oldContainers = contentEl.querySelectorAll(".print-title-container");
    oldContainers.forEach((container) => container.remove());
  }
  createButton(config, context, isEmsArea = false) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "print-title-container";
    this.styleContainer(buttonContainer, config.position, context);
    const button = document.createElement("button");
    button.textContent = config.text;
    button.className = config.className;
    this.styleButton(button);
    button.addEventListener("click", (e) => this.handleButtonClick(e, context, isEmsArea));
    this.addHoverEffects(button);
    buttonContainer.appendChild(button);
    return button;
  }
  styleContainer(container, position, context) {
    const hasFrontmatter = !!(context.frontmatter && Object.keys(context.frontmatter).length > 0);
    if (position === "after-frontmatter" && hasFrontmatter) {
      container.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 16px 0;
				padding: 8px 20px;
				border-top: 1px solid var(--background-modifier-border);
				border-bottom: 1px solid var(--background-modifier-border);
				background: var(--background-secondary);
			`;
    } else if (position === "top-right" || position === "after-frontmatter" && !hasFrontmatter) {
      container.style.cssText = `
				position: absolute;
				top: 20px;
				right: 20px;
				z-index: 100;
				display: flex;
				justify-content: center;
			`;
    } else {
      container.style.cssText = `
				display: flex;
				justify-content: center;
				margin: 20px 0;
				padding: 10px;
			`;
    }
  }
  styleButton(button) {
    button.style.cssText = `
			background: var(--interactive-accent, #8b5cf6);
			color: var(--text-on-accent, white);
			border: 1px solid var(--interactive-accent-hover, #7c3aed);
			border-radius: 6px;
			padding: 8px 16px;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s ease;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			-webkit-appearance: none;
			appearance: none;
		`;
  }
  addHoverEffects(button) {
    button.addEventListener("mouseenter", () => {
      button.style.background = "var(--interactive-accent-hover, #7c3aed)";
      button.style.transform = "translateY(-1px)";
      button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = "var(--interactive-accent, #8b5cf6)";
      button.style.transform = "translateY(0)";
      button.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
    });
  }
  handleButtonClick(event, context, isEmsArea = false) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      this.log(`Button clicked for file: ${context.fileName}, isEmsArea: ${isEmsArea}`);
      try {
        if (isEmsArea) {
          yield this.handleAreaAction(context);
        } else {
          yield this.handlePrintTitleAction(context);
        }
        const button = event.target;
        if (this.settings.animateButton) {
          button.style.transform = "scale(0.95)";
          setTimeout(() => {
            button.style.transform = "translateY(0)";
          }, 150);
        }
      } catch (error) {
        this.log("Error handling button click:", error);
        this.notificationService.showError("Failed to process action");
      }
    });
  }
  /**
   * Handle ems__Area specific actions
   */
  handleAreaAction(context) {
    return __async(this, null, function* () {
      var _a;
      this.log("Handling area action - creating child area");
      const exoContext = {
        fileName: context.fileName,
        filePath: context.filePath,
        file: context.file,
        frontmatter: context.frontmatter,
        currentPage: __spreadValues({
          file: {
            path: context.file.path,
            name: context.file.name,
            link: null,
            mtime: new Date(context.file.stat.mtime)
          },
          "exo__Instance_class": ((_a = context.frontmatter) == null ? void 0 : _a["exo__Instance_class"]) || []
        }, context.frontmatter)
      };
      yield this.areaCreationService.createChildArea(exoContext);
    });
  }
  /**
   * Handle standard print title action
   */
  handlePrintTitleAction(context) {
    return __async(this, null, function* () {
      if (this.settings.showEnhancedInfo) {
        this.notificationService.showTitleNotification(context);
      } else {
        const message = `${this.settings.showIcon ? "\u{1F4C4} " : ""}${context.file.basename}`;
        this.notificationService.showInfo(message.replace("\u2139\uFE0F ", ""));
      }
      if (this.settings.enableDebugMode && this.settings.showFileStats) {
        const analysis = yield this.fileAnalysisService.analyzeFile(context);
        const stats = this.fileAnalysisService.getFileStats(analysis);
        this.log(`File stats: ${stats.join(", ")}`);
      }
    });
  }
  insertButton(contentEl, button, position) {
    const container = button.parentElement;
    if (position === "after-frontmatter") {
      const frontmatterElement = this.findFrontmatterInsertionPoint(contentEl);
      if (frontmatterElement) {
        frontmatterElement.insertAdjacentElement("afterend", container);
        this.log("Button inserted after frontmatter");
        return;
      }
    }
    if (position === "top-right" || position === "after-frontmatter") {
      const firstChild = contentEl.firstElementChild;
      if (firstChild) {
        firstChild.insertAdjacentElement("beforebegin", container);
        this.log("Button inserted at top of content");
      } else {
        contentEl.appendChild(container);
        this.log("Button appended to empty content");
      }
    } else {
      contentEl.appendChild(container);
      this.log("Button appended at bottom");
    }
  }
  findFrontmatterInsertionPoint(containerEl) {
    this.log("Looking for frontmatter insertion point...");
    const frontmatterSelectors = [
      ".metadata-properties-container",
      ".metadata-container",
      ".frontmatter-container",
      ".property-container",
      ".metadata-property-container",
      ".document-properties",
      ".markdown-properties",
      ".frontmatter",
      "[data-property]"
    ];
    for (const selector of frontmatterSelectors) {
      const elements = containerEl.querySelectorAll(selector);
      if (elements.length > 0) {
        const lastElement = elements[elements.length - 1];
        this.log(`Found frontmatter with selector: ${selector}`);
        return lastElement;
      }
    }
    const allDivs = Array.from(containerEl.querySelectorAll("div"));
    for (const div of allDivs) {
      const className = div.className.toLowerCase();
      const textContent = (div.textContent || "").toLowerCase();
      if (className.includes("metadata") || className.includes("property") || textContent.includes("tags:") || textContent.includes("title:") || div.hasAttribute("data-property")) {
        this.log("Found frontmatter-like element:", div.className);
        return div;
      }
    }
    this.log("No frontmatter found");
    return null;
  }
  /**
   * Check if the current file is an ems__Area asset
   */
  isEmsAreaFile(view) {
    return __async(this, null, function* () {
      if (!view || !view.file) return false;
      try {
        const cache = this.app.metadataCache.getFileCache(view.file);
        const frontmatter = cache == null ? void 0 : cache.frontmatter;
        if (!frontmatter || !frontmatter["exo__Instance_class"]) {
          return false;
        }
        const instanceClasses = Array.isArray(frontmatter["exo__Instance_class"]) ? frontmatter["exo__Instance_class"] : [frontmatter["exo__Instance_class"]];
        return instanceClasses.some((cls) => {
          if (typeof cls === "string") {
            return cls.includes("ems__Area");
          } else if (cls && cls.path) {
            return cls.path.includes("ems__Area");
          }
          return false;
        });
      } catch (error) {
        this.log("Error checking if file is ems__Area:", error);
        return false;
      }
    });
  }
  log(message, ...args) {
    if (this.settings.enableDebugMode) {
      console.log(`[PrintTitle] ${message}`, ...args);
    }
  }
};

// src/services/ViewManager.ts
var import_obsidian = require("obsidian");
var ViewManager = class {
  constructor(app, buttonService, settings, areaLayoutService) {
    this.app = app;
    this.buttonService = buttonService;
    this.settings = settings;
    this.areaLayoutService = areaLayoutService;
  }
  /**
   * Update settings reference
   */
  updateSettings(settings) {
    this.settings = settings;
    this.buttonService.updateSettings(settings);
  }
  /**
   * Add buttons to all currently open markdown views
   */
  addButtonToAllViews() {
    const markdownViews = this.app.workspace.getLeavesOfType("markdown");
    this.log(`Found ${markdownViews.length} markdown views`);
    markdownViews.forEach((leaf) => {
      if (leaf.view instanceof import_obsidian.MarkdownView) {
        this.buttonService.addButtonToView(leaf.view);
      }
    });
  }
  /**
   * Handle file open event
   */
  onFileOpen(file) {
    this.log("File opened:", (file == null ? void 0 : file.name) || "unknown");
    if (file) {
      setTimeout(() => __async(this, null, function* () {
        this.addButtonToActiveView();
        yield this.renderAreaLayoutIfNeeded(file);
      }), 200);
    }
  }
  /**
   * Handle active leaf change event
   */
  onActiveLeafChange(leaf) {
    var _a;
    this.log("Active leaf changed:", ((_a = leaf == null ? void 0 : leaf.view) == null ? void 0 : _a.getViewType()) || "unknown");
    if (leaf && leaf.view instanceof import_obsidian.MarkdownView) {
      setTimeout(() => __async(this, null, function* () {
        const view = leaf.view;
        this.buttonService.addButtonToView(view);
        if (view.file) {
          yield this.renderAreaLayoutIfNeeded(view.file);
        }
      }), 200);
    }
  }
  /**
   * Handle layout change event
   */
  onLayoutChange() {
    this.log("Layout changed, refreshing buttons");
    setTimeout(() => {
      this.addButtonToAllViews();
    }, 300);
  }
  /**
   * Add button to the currently active view
   */
  addButtonToActiveView() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (activeView) {
      this.buttonService.addButtonToView(activeView);
    } else {
      this.log("No active MarkdownView found");
    }
  }
  /**
   * Refresh all buttons (remove and re-add)
   */
  refreshAllButtons() {
    this.log("Refreshing all buttons");
    this.buttonService.cleanup();
    setTimeout(() => {
      this.addButtonToAllViews();
    }, 100);
  }
  /**
   * Clean up all buttons
   */
  cleanup() {
    this.log("Cleaning up view manager");
    this.buttonService.cleanup();
  }
  /**
   * Check if file is ems__Area and render layout if needed
   */
  renderAreaLayoutIfNeeded(file) {
    return __async(this, null, function* () {
      var _a;
      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache == null ? void 0 : cache.frontmatter;
      if (!frontmatter || !frontmatter["exo__Instance_class"]) {
        return;
      }
      const instanceClasses = Array.isArray(frontmatter["exo__Instance_class"]) ? frontmatter["exo__Instance_class"] : [frontmatter["exo__Instance_class"]];
      const isArea = instanceClasses.some(
        (cls) => {
          var _a2;
          return typeof cls === "string" ? cls.includes("ems__Area") : (_a2 = cls.path) == null ? void 0 : _a2.includes("ems__Area");
        }
      );
      if (!isArea) {
        return;
      }
      this.log("Detected ems__Area file, rendering layout");
      yield new Promise((resolve) => setTimeout(resolve, 500));
      const activeView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
      if (!activeView || ((_a = activeView.file) == null ? void 0 : _a.path) !== file.path) {
        return;
      }
      const fileContext = {
        fileName: file.name,
        filePath: file.path,
        file,
        frontmatter,
        currentPage: __spreadValues({
          file: {
            path: file.path,
            name: file.name,
            link: null,
            mtime: new Date(file.stat.mtime)
          },
          "exo__Instance_class": frontmatter["exo__Instance_class"] || []
        }, frontmatter)
      };
      const contentEl = activeView.contentEl;
      const existingContainers = contentEl.querySelectorAll(".area-layout-auto-container");
      existingContainers.forEach((el) => el.remove());
      const layoutContainer = contentEl.createDiv("area-layout-auto-container");
      const isReadingMode = contentEl.querySelector(".markdown-reading-view") !== null;
      if (isReadingMode) {
        const readingView = contentEl.querySelector(".markdown-reading-view");
        if (readingView) {
          const previewSection = readingView.querySelector(".markdown-preview-section");
          if (previewSection && previewSection.parentElement) {
            previewSection.parentElement.appendChild(layoutContainer);
          } else {
            readingView.appendChild(layoutContainer);
          }
        }
      } else {
        const sourceView = contentEl.querySelector(".markdown-source-view");
        if (sourceView) {
          const cmContent = sourceView.querySelector(".cm-content");
          if (cmContent && cmContent.parentElement) {
            const wrapper = cmContent.parentElement;
            wrapper.appendChild(layoutContainer);
          } else {
            sourceView.appendChild(layoutContainer);
          }
        }
      }
      try {
        yield this.areaLayoutService.renderAreaLayout(layoutContainer, fileContext);
        this.log("Area layout rendered successfully");
      } catch (error) {
        console.error("[ViewManager] Error rendering area layout:", error);
      }
    });
  }
  log(message, ...args) {
    if (this.settings.enableDebugMode) {
      console.log(`[PrintTitle ViewManager] ${message}`, ...args);
    }
  }
};

// src/services/SettingsService.ts
var import_obsidian2 = require("obsidian");
var PrintTitleSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Print Title Plugin Settings" });
    new import_obsidian2.Setting(containerEl).setName("Button text").setDesc("Text displayed on the button").addText((text) => text.setPlaceholder("Print Title").setValue(this.plugin.settings.buttonText).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.buttonText = value || "Print Title";
      yield this.plugin.saveSettings();
      this.plugin.refreshAllButtons();
    })));
    new import_obsidian2.Setting(containerEl).setName("Button position").setDesc("Where to place the button in the note").addDropdown((dropdown) => dropdown.addOption("after-frontmatter", "After frontmatter (smart)").addOption("top-right", "Top right corner").addOption("bottom", "Bottom of note").setValue(this.plugin.settings.buttonPosition).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.buttonPosition = value;
      yield this.plugin.saveSettings();
      this.plugin.refreshAllButtons();
    })));
    new import_obsidian2.Setting(containerEl).setName("Show icon").setDesc("Display an icon next to the button text").addToggle((toggle) => toggle.setValue(this.plugin.settings.showIcon).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.showIcon = value;
      yield this.plugin.saveSettings();
      this.plugin.refreshAllButtons();
    })));
    new import_obsidian2.Setting(containerEl).setName("Button icon").setDesc("Icon to display (emoji or text)").addText((text) => text.setPlaceholder("\u{1F4C4}").setValue(this.plugin.settings.buttonIcon).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.buttonIcon = value;
      yield this.plugin.saveSettings();
      this.plugin.refreshAllButtons();
    })));
    new import_obsidian2.Setting(containerEl).setName("Notification duration").setDesc("How long notifications are displayed (milliseconds)").addText((text) => text.setPlaceholder("3000").setValue(this.plugin.settings.notificationDuration.toString()).onChange((value) => __async(this, null, function* () {
      const duration = parseInt(value) || 3e3;
      this.plugin.settings.notificationDuration = Math.max(1e3, Math.min(1e4, duration));
      yield this.plugin.saveSettings();
    })));
    new import_obsidian2.Setting(containerEl).setName("Show enhanced information").setDesc("Display additional file information in notifications (tags, word count, etc.)").addToggle((toggle) => toggle.setValue(this.plugin.settings.showEnhancedInfo).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.showEnhancedInfo = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian2.Setting(containerEl).setName("Animate button").setDesc("Enable button click animations and hover effects").addToggle((toggle) => toggle.setValue(this.plugin.settings.animateButton).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.animateButton = value;
      yield this.plugin.saveSettings();
      this.plugin.refreshAllButtons();
    })));
    new import_obsidian2.Setting(containerEl).setName("Show file statistics").setDesc("Analyze and display file statistics in debug mode").addToggle((toggle) => toggle.setValue(this.plugin.settings.showFileStats).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.showFileStats = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian2.Setting(containerEl).setName("Debug mode").setDesc("Enable detailed console logging for troubleshooting").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableDebugMode).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableDebugMode = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian2.Setting(containerEl).setName("Custom CSS").setDesc("Additional CSS to style the button (advanced users)").addTextArea((text) => text.setPlaceholder("/* Custom CSS for .print-title-button */\n.print-title-button {\n  /* Your styles here */\n}").setValue(this.plugin.settings.customCSS).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.customCSS = value;
      yield this.plugin.saveSettings();
      this.plugin.applyCustomStyles();
    })));
    containerEl.createEl("h3", { text: "Reset Settings" });
    new import_obsidian2.Setting(containerEl).setName("Reset to defaults").setDesc("Reset all settings to their default values").addButton((button) => button.setButtonText("Reset").setWarning().onClick(() => __async(this, null, function* () {
      this.plugin.settings = __spreadValues({}, this.plugin.getDefaultSettings());
      yield this.plugin.saveSettings();
      this.plugin.refreshAllButtons();
      this.plugin.applyCustomStyles();
      this.display();
    })));
    containerEl.createEl("h3", { text: "About" });
    const aboutEl = containerEl.createEl("div");
    aboutEl.innerHTML = `
			<p><strong>Print Title Plugin v${this.plugin.manifest.version}</strong></p>
			<p>Adds a customizable button to display the current note's title.</p>
			<p>Features:</p>
			<ul>
				<li>Smart positioning after frontmatter</li>
				<li>Customizable button text and icon</li>
				<li>Multiple position options</li>
				<li>Debug mode for troubleshooting</li>
			</ul>
		`;
  }
};

// src/services/NotificationService.ts
var import_obsidian3 = require("obsidian");
var NotificationService = class {
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
    const notice = new import_obsidian3.Notice(message, this.settings.notificationDuration);
    this.styleNotice(notice, context);
    this.log(`Showed notification: ${message}`);
  }
  /**
   * Show error notification
   */
  showError(message) {
    new import_obsidian3.Notice(`\u274C Print Title: ${message}`, 5e3);
    this.log(`Error: ${message}`);
  }
  /**
   * Show success notification
   */
  showSuccess(message) {
    new import_obsidian3.Notice(`\u2705 ${message}`, 2e3);
    this.log(`Success: ${message}`);
  }
  /**
   * Show info notification
   */
  showInfo(message) {
    new import_obsidian3.Notice(`\u2139\uFE0F ${message}`, 3e3);
    this.log(`Info: ${message}`);
  }
  buildNotificationMessage(context) {
    var _a, _b;
    const { file, frontmatter } = context;
    let message = this.settings.showIcon ? `\u{1F4C4} ${file.basename}` : file.basename;
    const additionalInfo = [];
    if ((frontmatter == null ? void 0 : frontmatter.tags) && Array.isArray(frontmatter.tags)) {
      const tagCount = frontmatter.tags.length;
      if (tagCount > 0) {
        additionalInfo.push(`${tagCount} tag${tagCount > 1 ? "s" : ""}`);
      }
    }
    if ((_a = file.stat) == null ? void 0 : _a.size) {
      const estimatedWords = Math.ceil(file.stat.size / 6);
      if (estimatedWords > 0) {
        additionalInfo.push(`~${estimatedWords} words`);
      }
    }
    if ((frontmatter == null ? void 0 : frontmatter.created) || ((_b = file.stat) == null ? void 0 : _b.ctime)) {
      const date = (frontmatter == null ? void 0 : frontmatter.created) ? new Date(frontmatter.created) : new Date(file.stat.ctime);
      const dateStr = date.toLocaleDateString();
      additionalInfo.push(`Created: ${dateStr}`);
    }
    if (additionalInfo.length > 0) {
      message += `
${additionalInfo.join(" \u2022 ")}`;
    }
    return message;
  }
  styleNotice(notice, context) {
    var _a;
    const noticeEl = notice.noticeEl;
    if (!noticeEl) return;
    noticeEl.addClass("print-title-notice");
    if ((_a = context.frontmatter) == null ? void 0 : _a.tags) {
      noticeEl.addClass("has-tags");
    }
    noticeEl.style.cssText += `
			border-left: 4px solid var(--interactive-accent);
			padding: 12px 16px;
			border-radius: 6px;
			font-family: var(--font-interface);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		`;
    noticeEl.addEventListener("mouseenter", () => {
      noticeEl.style.transform = "translateY(-2px)";
      noticeEl.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
    });
    noticeEl.addEventListener("mouseleave", () => {
      noticeEl.style.transform = "translateY(0)";
      noticeEl.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    });
  }
  log(message) {
    if (this.settings.enableDebugMode) {
      console.log(`[PrintTitle NotificationService] ${message}`);
    }
  }
};

// src/services/FileAnalysisService.ts
var FileAnalysisService = class {
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
  analyzeFile(context) {
    return __async(this, null, function* () {
      const { file } = context;
      try {
        const content = yield this.app.vault.read(file);
        const cache = this.app.metadataCache.getFileCache(file);
        return this.performAnalysis(content, cache);
      } catch (error) {
        this.log(`Error analyzing file ${file.path}:`, error);
        return this.getDefaultAnalysis();
      }
    });
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
      stats.push("has images");
    }
    stats.push(`${analysis.complexity} complexity`);
    return stats;
  }
  /**
   * Determine if file is substantial enough to show enhanced info
   */
  isSubstantialFile(analysis) {
    return analysis.wordCount > 50 || analysis.linkCount > 3 || analysis.tagCount > 2 || analysis.hasImages;
  }
  performAnalysis(content, cache) {
    var _a, _b, _c, _d;
    const words = content.match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    const characterCount = content.replace(/\s/g, "").length;
    const linkCount = (((_a = cache == null ? void 0 : cache.links) == null ? void 0 : _a.length) || 0) + (((_b = cache == null ? void 0 : cache.embeds) == null ? void 0 : _b.length) || 0);
    const tagCount = ((_c = cache == null ? void 0 : cache.tags) == null ? void 0 : _c.length) || 0;
    const hasImages = !!((_d = cache == null ? void 0 : cache.embeds) == null ? void 0 : _d.some(
      (embed) => embed.link.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
    ));
    const estimatedReadingTime = Math.ceil(wordCount / 250);
    let complexity = "simple";
    if (wordCount > 500 || linkCount > 10 || tagCount > 5) {
      complexity = "moderate";
    }
    if (wordCount > 1500 || linkCount > 25 || tagCount > 10) {
      complexity = "complex";
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
      complexity: "simple"
    };
  }
  log(message, ...args) {
    if (this.settings.enableDebugMode) {
      console.log(`[PrintTitle FileAnalysisService] ${message}`, ...args);
    }
  }
};

// src/services/DataviewAdapter.ts
var DataviewAdapter = class {
  constructor(app) {
    this.app = app;
    this.isReady = false;
    this.readyPromise = null;
    this.initializeDataview();
  }
  initializeDataview() {
    return __async(this, null, function* () {
      if (this.readyPromise) {
        return this.readyPromise;
      }
      this.readyPromise = new Promise((resolve) => {
        const checkDataview = () => {
          var _a, _b, _c, _d;
          const dataviewAPI = (_c = (_b = (_a = this.app.plugins) == null ? void 0 : _a.plugins) == null ? void 0 : _b.dataview) == null ? void 0 : _c.api;
          if (dataviewAPI && ((_d = dataviewAPI.index) == null ? void 0 : _d.initialized)) {
            this.isReady = true;
            resolve();
          } else {
            setTimeout(checkDataview, 100);
          }
        };
        checkDataview();
      });
      return this.readyPromise;
    });
  }
  waitForIndexReady() {
    return __async(this, null, function* () {
      yield this.initializeDataview();
    });
  }
  get api() {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.app.plugins) == null ? void 0 : _a.plugins) == null ? void 0 : _b.dataview) == null ? void 0 : _c.api;
  }
  get name() {
    return "Dataview";
  }
  /**
   * Query all pages or pages from a specific source
   */
  queryPages(source) {
    return __async(this, null, function* () {
      yield this.waitForIndexReady();
      const api = this.api;
      if (!api) {
        console.error("[DataviewAdapter] Dataview API not available");
        return [];
      }
      try {
        const pages = source ? api.pages(source) : api.pages();
        return pages.array().map((page) => this.convertDataviewPageToExoAsset(page));
      } catch (error) {
        console.error("[DataviewAdapter] Error querying pages:", error);
        return [];
      }
    });
  }
  /**
   * Get a specific page by path or name
   */
  getPage(pathOrName) {
    return __async(this, null, function* () {
      yield this.waitForIndexReady();
      const api = this.api;
      if (!api) {
        console.error("[DataviewAdapter] Dataview API not available");
        return null;
      }
      try {
        const page = api.page(pathOrName);
        if (!page) return null;
        return this.convertDataviewPageToExoAsset(page);
      } catch (error) {
        console.error("[DataviewAdapter] Error getting page:", error);
        return null;
      }
    });
  }
  /**
   * Find assets by class
   */
  findAssetsByClass(assetClass) {
    return __async(this, null, function* () {
      yield this.waitForIndexReady();
      const api = this.api;
      if (!api) {
        console.error("[DataviewAdapter] Dataview API not available");
        return [];
      }
      try {
        const pages = api.pages().where((p) => {
          const instanceClass = p["exo__Instance_class"] || p["exo__instance_class"];
          if (!instanceClass) return false;
          if (Array.isArray(instanceClass)) {
            return instanceClass.some(
              (cls) => {
                var _a;
                return typeof cls === "string" ? cls.includes(assetClass) : (_a = cls.path) == null ? void 0 : _a.includes(assetClass);
              }
            );
          } else if (typeof instanceClass === "string") {
            return instanceClass.includes(assetClass);
          } else if (instanceClass.path) {
            return instanceClass.path.includes(assetClass);
          }
          return false;
        });
        return pages.array().map((page) => this.convertDataviewPageToExoAsset(page));
      } catch (error) {
        console.error("[DataviewAdapter] Error finding assets by class:", error);
        return [];
      }
    });
  }
  /**
   * Find child areas for a given parent area
   */
  findChildAreas(parentAreaName) {
    return __async(this, null, function* () {
      yield this.waitForIndexReady();
      const api = this.api;
      if (!api) {
        console.error("[DataviewAdapter] Dataview API not available");
        return [];
      }
      try {
        const pages = api.pages().where((p) => {
          var _a, _b, _c;
          const instanceClass = p["exo__Instance_class"] || p["exo__instance_class"];
          const parent = p["ems__Area_parent"];
          const isArea = Array.isArray(instanceClass) ? instanceClass.some(
            (cls) => {
              var _a2;
              return typeof cls === "string" ? cls.includes("ems__Area") : (_a2 = cls.path) == null ? void 0 : _a2.includes("ems__Area");
            }
          ) : typeof instanceClass === "string" ? instanceClass.includes("ems__Area") : (_a = instanceClass == null ? void 0 : instanceClass.path) == null ? void 0 : _a.includes("ems__Area");
          if (!isArea || !parent) return false;
          const parentName = typeof parent === "string" ? parent.replace(/[\[\]]/g, "") : (_c = (_b = parent.path) == null ? void 0 : _b.split("/").pop()) == null ? void 0 : _c.replace(".md", "");
          return parentName === parentAreaName;
        });
        return pages.array().map((page) => this.convertDataviewPageToExoAsset(page));
      } catch (error) {
        console.error("[DataviewAdapter] Error finding child areas:", error);
        return [];
      }
    });
  }
  /**
   * Convert Dataview page object to ExoAsset format
   */
  convertDataviewPageToExoAsset(page) {
    var _a, _b, _c, _d, _e;
    if (!page) return null;
    const asset = {};
    for (const [key, value] of Object.entries(page)) {
      if (!key.startsWith("$")) {
        asset[key] = value;
      }
    }
    asset.file = {
      path: ((_a = page.file) == null ? void 0 : _a.path) || page.$path || page.path,
      name: ((_b = page.file) == null ? void 0 : _b.name) || page.$name || page.name || ((_c = page.$path) == null ? void 0 : _c.split("/").pop()),
      link: ((_d = page.file) == null ? void 0 : _d.link) || page.$link || page.link,
      mtime: ((_e = page.file) == null ? void 0 : _e.mtime) || page.$mtime || /* @__PURE__ */ new Date()
    };
    if (page.$frontmatter) {
      for (const [key, value] of Object.entries(page.$frontmatter)) {
        if (!(key in asset)) {
          const actualValue = (value == null ? void 0 : value.value) !== void 0 ? value.value : value;
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
    const instanceClass = asset["exo__Instance_class"] || asset["exo__instance_class"];
    if (!instanceClass) return false;
    if (Array.isArray(instanceClass)) {
      return instanceClass.some(
        (cls) => {
          var _a;
          return typeof cls === "string" ? cls.includes("ems__Area") : (_a = cls == null ? void 0 : cls.path) == null ? void 0 : _a.includes("ems__Area");
        }
      );
    } else if (typeof instanceClass === "string") {
      return instanceClass.includes("ems__Area");
    } else if (instanceClass && typeof instanceClass === "object" && instanceClass.path) {
      return instanceClass.path.includes("ems__Area");
    }
    return false;
  }
  /**
   * Extract class names from an asset
   */
  extractAssetClasses(asset) {
    const instanceClass = asset["exo__Instance_class"] || asset["exo__instance_class"];
    if (!instanceClass) return [];
    const classArray = Array.isArray(instanceClass) ? instanceClass : [instanceClass];
    return classArray.map((cls) => {
      var _a;
      if (typeof cls === "string") {
        return cls.replace(/[\[\]]/g, "");
      } else if (cls.path) {
        return ((_a = cls.path.split("/").pop()) == null ? void 0 : _a.replace(".md", "")) || "unknown";
      }
      return "unknown";
    });
  }
};

// src/services/AreaLayoutService.ts
var import_obsidian5 = require("obsidian");

// src/services/AreaCreationService.ts
var import_obsidian4 = require("obsidian");
var AreaCreationModal = class extends import_obsidian4.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.result = { name: null };
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Create New Child Area" });
    const inputContainer = contentEl.createDiv();
    inputContainer.style.marginBottom = "20px";
    const input = inputContainer.createEl("input", {
      type: "text",
      placeholder: "Enter area name..."
    });
    input.style.width = "100%";
    input.style.padding = "8px";
    input.style.fontSize = "14px";
    input.style.border = "1px solid var(--background-modifier-border)";
    input.style.borderRadius = "4px";
    input.style.background = "var(--background-modifier-form-field)";
    input.style.color = "var(--text-normal)";
    const buttonContainer = contentEl.createDiv();
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";
    buttonContainer.style.justifyContent = "flex-end";
    const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
    cancelButton.style.padding = "8px 16px";
    cancelButton.style.border = "1px solid var(--background-modifier-border)";
    cancelButton.style.borderRadius = "4px";
    cancelButton.style.background = "var(--background-secondary)";
    cancelButton.style.color = "var(--text-normal)";
    cancelButton.style.cursor = "pointer";
    const createButton = buttonContainer.createEl("button", { text: "Create" });
    createButton.style.padding = "8px 16px";
    createButton.style.border = "none";
    createButton.style.borderRadius = "4px";
    createButton.style.background = "var(--interactive-accent)";
    createButton.style.color = "var(--text-on-accent)";
    createButton.style.cursor = "pointer";
    const submit = () => {
      const name = input.value.trim();
      this.result.name = name || null;
      this.close();
    };
    createButton.addEventListener("click", submit);
    cancelButton.addEventListener("click", () => {
      this.result.name = null;
      this.close();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        submit();
      } else if (e.key === "Escape") {
        this.result.name = null;
        this.close();
      }
    });
    setTimeout(() => input.focus(), 50);
  }
  onClose() {
    this.onSubmit(this.result);
  }
};
var AreaCreationService = class {
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
   * Create a new child area for the given parent area
   */
  createChildArea(parentContext) {
    return __async(this, null, function* () {
      this.log("Creating child area for:", parentContext.fileName);
      try {
        const areaName = yield this.showAreaNameModal();
        if (!areaName) {
          this.log("Area creation cancelled");
          return;
        }
        const creationData = this.prepareAreaCreationData(areaName, parentContext);
        const content = this.generateAreaContent(creationData);
        const filePath = this.generateAreaFilePath(areaName);
        yield this.createAreaFile(filePath, content);
        yield this.openNewArea(filePath);
        new import_obsidian4.Notice(`Created new child area: ${areaName}`);
        this.log(`Successfully created child area: ${areaName} at ${filePath}`);
      } catch (error) {
        const errorMessage = `Failed to create area: ${error instanceof Error ? error.message : String(error)}`;
        console.error("[AreaCreationService]", errorMessage, error);
        new import_obsidian4.Notice(errorMessage);
      }
    });
  }
  /**
   * Show modal to get area name from user
   */
  showAreaNameModal() {
    return new Promise((resolve) => {
      new AreaCreationModal(this.app, (result) => {
        resolve(result.name);
      }).open();
    });
  }
  /**
   * Prepare area creation data
   */
  prepareAreaCreationData(name, parentContext) {
    return {
      name,
      parentPath: parentContext.fileName.replace(".md", ""),
      parentOntology: this.getParentOntology(parentContext),
      createdAt: this.getLocalTimestamp(),
      uid: this.generateUUID()
    };
  }
  /**
   * Generate area content with proper frontmatter
   */
  generateAreaContent(data) {
    return `---
exo__Asset_isDefinedBy: ${data.parentOntology}
exo__Asset_uid: ${data.uid}
exo__Asset_createdAt: ${data.createdAt}
exo__Instance_class:
  - "[[ems__Area]]"
ems__Area_parent: "[[${data.parentPath}]]"
---

# ${data.name}

`;
  }
  /**
   * Generate file path for the new area
   */
  generateAreaFilePath(name) {
    var _a;
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      const parentDir = ((_a = activeFile.parent) == null ? void 0 : _a.path) || "";
      if (parentDir) {
        return `${parentDir}/Area - ${name}.md`;
      }
    }
    return `03 Knowledge/Areas/Area - ${name}.md`;
  }
  /**
   * Create the area file
   */
  createAreaFile(filePath, content) {
    return __async(this, null, function* () {
      const parentPath = filePath.substring(0, filePath.lastIndexOf("/"));
      if (parentPath && !this.app.vault.getAbstractFileByPath(parentPath)) {
        yield this.app.vault.createFolder(parentPath);
        this.log(`Created parent directory: ${parentPath}`);
      }
      return yield this.app.vault.create(filePath, content);
    });
  }
  /**
   * Open the newly created area in a new tab
   */
  openNewArea(filePath) {
    return __async(this, null, function* () {
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (file instanceof import_obsidian4.TFile) {
        const leaf = this.app.workspace.getLeaf("tab");
        yield leaf.openFile(file);
        this.app.workspace.setActiveLeaf(leaf, { focus: true });
      }
    });
  }
  /**
   * Generate UUID for the area
   */
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : r & 3 | 8).toString(16);
    });
  }
  /**
   * Get local timestamp without Z suffix
   */
  getLocalTimestamp() {
    const now = /* @__PURE__ */ new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  }
  /**
   * Get parent ontology from file context
   */
  getParentOntology(parentContext) {
    var _a;
    const parentOntology = parentContext.currentPage["exo__Asset_isDefinedBy"];
    if (typeof parentOntology === "object" && parentOntology.path) {
      return `"[[${(_a = parentOntology.path.split("/").pop()) == null ? void 0 : _a.replace(".md", "")}]]"`;
    }
    if (typeof parentOntology === "string") {
      return parentOntology;
    }
    return '"[[!ems]]"';
  }
  /**
   * Debug logging
   */
  log(message, ...args) {
    if (this.settings.enableDebugMode) {
      console.log(`[AreaCreationService] ${message}`, ...args);
    }
  }
};

// src/services/AreaLayoutService.ts
var AreaLayoutService = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
    this.dataviewAdapter = new DataviewAdapter(app);
    this.areaCreationService = new AreaCreationService(app, settings);
  }
  /**
   * Update settings reference
   */
  updateSettings(settings) {
    this.settings = settings;
    this.areaCreationService.updateSettings(settings);
  }
  /**
   * Render area layout for ems__Area assets
   */
  renderAreaLayout(container, fileContext) {
    return __async(this, null, function* () {
      this.log("Rendering area layout for:", fileContext.fileName);
      try {
        container.innerHTML = "";
        const layoutContainer = container.createEl("div", {
          cls: "area-layout-container"
        });
        this.renderAreaHeader(layoutContainer, fileContext);
        yield this.renderChildAreasSection(layoutContainer, fileContext);
        yield this.renderUnresolvedTasksSection(layoutContainer, fileContext);
        yield this.renderUnresolvedProjectsSection(layoutContainer, fileContext);
        this.applyAreaLayoutStyles(container);
        this.log("Area layout rendered successfully");
      } catch (error) {
        console.error("[AreaLayoutService] Error rendering area layout:", error);
        this.renderError(container, `Failed to render area layout: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }
  /**
   * Render area header with title and metadata
   */
  renderAreaHeader(container, fileContext) {
    const header = container.createEl("div", { cls: "area-header" });
    const title = header.createEl("h1", {
      text: fileContext.file.basename,
      cls: "area-title"
    });
    const metadata = fileContext.currentPage;
    if (metadata["exo__Asset_createdAt"] || metadata["ems__Area_parent"]) {
      const metaContainer = header.createEl("div", { cls: "area-metadata" });
      if (metadata["exo__Asset_createdAt"]) {
        const createdAt = new Date(metadata["exo__Asset_createdAt"]).toLocaleDateString();
        metaContainer.createEl("span", {
          text: `Created: ${createdAt}`,
          cls: "area-meta-item"
        });
      }
      if (metadata["ems__Area_parent"]) {
        const parent = this.extractLinkText(metadata["ems__Area_parent"]);
        metaContainer.createEl("span", {
          text: `Parent: ${parent}`,
          cls: "area-meta-item"
        });
      }
    }
  }
  /**
   * Render child areas section
   */
  renderChildAreasSection(container, fileContext) {
    return __async(this, null, function* () {
      const section = container.createEl("div", { cls: "area-section" });
      const header = section.createEl("div", { cls: "area-section-header" });
      header.createEl("h2", { text: "\u{1F4C1} Child Areas" });
      const createButton = header.createEl("button", {
        text: "+ Create Child Area",
        cls: "area-action-button create-child-button"
      });
      createButton.addEventListener("click", () => __async(this, null, function* () {
        yield this.areaCreationService.createChildArea(fileContext);
      }));
      const content = section.createEl("div", { cls: "area-section-content" });
      try {
        const areaName = fileContext.fileName.replace(".md", "");
        const childAreas = yield this.dataviewAdapter.findChildAreas(areaName);
        if (childAreas.length === 0) {
          content.createEl("p", {
            text: "No child areas found",
            cls: "area-empty-state"
          });
        } else {
          const list = content.createEl("ul", { cls: "area-list" });
          for (const area of childAreas) {
            const item = list.createEl("li", { cls: "area-list-item" });
            const link = item.createEl("a", {
              text: area.file.name.replace("Area - ", "").replace(".md", ""),
              cls: "area-link"
            });
            link.addEventListener("click", (e) => __async(this, null, function* () {
              e.preventDefault();
              const file = this.app.vault.getAbstractFileByPath(area.file.path);
              if (file instanceof import_obsidian5.TFile) {
                const leaf = this.app.workspace.getLeaf();
                yield leaf.openFile(file);
              }
            }));
          }
        }
      } catch (error) {
        console.error("[AreaLayoutService] Error loading child areas:", error);
        content.createEl("p", {
          text: "Error loading child areas",
          cls: "area-error"
        });
      }
    });
  }
  /**
   * Render unresolved tasks section
   */
  renderUnresolvedTasksSection(container, fileContext) {
    return __async(this, null, function* () {
      const section = container.createEl("div", { cls: "area-section" });
      const header = section.createEl("div", { cls: "area-section-header" });
      header.createEl("h2", { text: "\u{1F4CB} Unresolved Tasks" });
      const content = section.createEl("div", { cls: "area-section-content" });
      try {
        const areaName = fileContext.fileName.replace(".md", "");
        const tasks = yield this.findUnresolvedEfforts(areaName, "ems__Task");
        if (tasks.length === 0) {
          content.createEl("p", {
            text: "No unresolved tasks",
            cls: "area-empty-state"
          });
        } else {
          const list = content.createEl("ul", { cls: "area-list" });
          for (const task of tasks) {
            const item = list.createEl("li", { cls: "area-list-item" });
            const link = item.createEl("a", {
              text: task.file.name.replace(".md", ""),
              cls: "area-link"
            });
            if (task["ems__Effort_status"]) {
              const status = this.extractLinkText(task["ems__Effort_status"]);
              item.createEl("span", {
                text: ` (${status})`,
                cls: "area-status"
              });
            }
            link.addEventListener("click", (e) => __async(this, null, function* () {
              e.preventDefault();
              const file = this.app.vault.getAbstractFileByPath(task.file.path);
              if (file instanceof import_obsidian5.TFile) {
                const leaf = this.app.workspace.getLeaf();
                yield leaf.openFile(file);
              }
            }));
          }
        }
      } catch (error) {
        console.error("[AreaLayoutService] Error loading tasks:", error);
        content.createEl("p", {
          text: "Error loading tasks",
          cls: "area-error"
        });
      }
    });
  }
  /**
   * Render unresolved projects section
   */
  renderUnresolvedProjectsSection(container, fileContext) {
    return __async(this, null, function* () {
      const section = container.createEl("div", { cls: "area-section" });
      const header = section.createEl("div", { cls: "area-section-header" });
      header.createEl("h2", { text: "\u{1F680} Unresolved Projects" });
      const content = section.createEl("div", { cls: "area-section-content" });
      try {
        const areaName = fileContext.fileName.replace(".md", "");
        const projects = yield this.findUnresolvedEfforts(areaName, "ems__Project");
        if (projects.length === 0) {
          content.createEl("p", {
            text: "No unresolved projects",
            cls: "area-empty-state"
          });
        } else {
          const list = content.createEl("ul", { cls: "area-list" });
          for (const project of projects) {
            const item = list.createEl("li", { cls: "area-list-item" });
            const link = item.createEl("a", {
              text: project.file.name.replace(".md", ""),
              cls: "area-link"
            });
            if (project["ems__Effort_status"]) {
              const status = this.extractLinkText(project["ems__Effort_status"]);
              item.createEl("span", {
                text: ` (${status})`,
                cls: "area-status"
              });
            }
            link.addEventListener("click", (e) => __async(this, null, function* () {
              e.preventDefault();
              const file = this.app.vault.getAbstractFileByPath(project.file.path);
              if (file instanceof import_obsidian5.TFile) {
                const leaf = this.app.workspace.getLeaf();
                yield leaf.openFile(file);
              }
            }));
          }
        }
      } catch (error) {
        console.error("[AreaLayoutService] Error loading projects:", error);
        content.createEl("p", {
          text: "Error loading projects",
          cls: "area-error"
        });
      }
    });
  }
  /**
   * Find unresolved efforts (tasks/projects) for an area
   */
  findUnresolvedEfforts(areaName, effortType) {
    return __async(this, null, function* () {
      const api = this.dataviewAdapter.api;
      if (!api) return [];
      try {
        const efforts = api.pages().where((p) => {
          var _a, _b, _c, _d, _e;
          const instanceClass = p["exo__Instance_class"] || p["exo__instance_class"];
          const area = p["ems__Effort_area"];
          const status = p["ems__Effort_status"];
          const isRightType = Array.isArray(instanceClass) ? instanceClass.some(
            (cls) => {
              var _a2;
              return typeof cls === "string" ? cls.includes(effortType) : (_a2 = cls.path) == null ? void 0 : _a2.includes(effortType);
            }
          ) : typeof instanceClass === "string" ? instanceClass.includes(effortType) : (_a = instanceClass == null ? void 0 : instanceClass.path) == null ? void 0 : _a.includes(effortType);
          if (!isRightType || !area) return false;
          const areaName_clean = typeof area === "string" ? area.replace(/[\[\]]/g, "") : (_c = (_b = area.path) == null ? void 0 : _b.split("/").pop()) == null ? void 0 : _c.replace(".md", "");
          const isInArea = areaName_clean === areaName;
          if (!isInArea) return false;
          if (!status) return true;
          const statusText = typeof status === "string" ? status.replace(/[\[\]]/g, "").toLowerCase() : (_e = (_d = status.path) == null ? void 0 : _d.split("/").pop()) == null ? void 0 : _e.replace(".md", "").toLowerCase();
          return statusText !== "done" && statusText !== "completed";
        });
        return efforts.array().map((page) => this.dataviewAdapter.convertDataviewPageToExoAsset(page));
      } catch (error) {
        console.error("[AreaLayoutService] Error finding unresolved efforts:", error);
        return [];
      }
    });
  }
  /**
   * Extract text from link reference
   */
  extractLinkText(linkRef) {
    var _a;
    if (typeof linkRef === "string") {
      return linkRef.replace(/[\[\]]/g, "");
    } else if (linkRef == null ? void 0 : linkRef.path) {
      return ((_a = linkRef.path.split("/").pop()) == null ? void 0 : _a.replace(".md", "")) || "Unknown";
    }
    return "Unknown";
  }
  /**
   * Apply area layout styles
   */
  applyAreaLayoutStyles(container) {
    if (document.querySelector("#area-layout-styles")) return;
    const style = document.createElement("style");
    style.id = "area-layout-styles";
    style.textContent = `
      /* Auto-generated area layout container */
      .area-layout-auto-container {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 3px solid var(--background-modifier-border);
      }
      
      .area-layout-container {
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
      }
      
      .area-header {
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid var(--background-modifier-border);
      }
      
      .area-title {
        margin: 0 0 10px 0;
        color: var(--text-normal);
        font-size: 2em;
      }
      
      .area-metadata {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }
      
      .area-meta-item {
        font-size: 0.9em;
        color: var(--text-muted);
        background: var(--background-secondary);
        padding: 4px 8px;
        border-radius: 4px;
      }
      
      .area-section {
        margin-bottom: 30px;
        background: var(--background-secondary);
        border-radius: 8px;
        padding: 20px;
        border: 1px solid var(--background-modifier-border);
      }
      
      .area-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .area-section-header h2 {
        margin: 0;
        color: var(--text-normal);
        font-size: 1.3em;
      }
      
      .area-action-button {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid var(--interactive-accent);
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.2s ease;
      }
      
      .area-action-button:hover {
        background: var(--interactive-accent-hover);
        border-color: var(--interactive-accent-hover);
        transform: translateY(-1px);
      }
      
      .area-section-content {
        min-height: 50px;
      }
      
      .area-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .area-list-item {
        padding: 8px 0;
        border-bottom: 1px solid var(--background-modifier-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .area-list-item:last-child {
        border-bottom: none;
      }
      
      .area-link {
        color: var(--text-accent);
        text-decoration: none;
        font-weight: 500;
        cursor: pointer;
        flex: 1;
      }
      
      .area-link:hover {
        color: var(--text-accent-hover);
        text-decoration: underline;
      }
      
      .area-status {
        font-size: 0.8em;
        color: var(--text-muted);
        background: var(--background-primary);
        padding: 2px 6px;
        border-radius: 3px;
      }
      
      .area-empty-state {
        color: var(--text-muted);
        font-style: italic;
        text-align: center;
        padding: 20px;
        margin: 0;
      }
      
      .area-error {
        color: var(--text-error);
        text-align: center;
        padding: 10px;
        margin: 0;
        background: var(--background-primary-alt);
        border-radius: 4px;
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .area-layout-container {
          padding: 15px;
        }
        
        .area-section {
          padding: 15px;
        }
        
        .area-section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        .area-metadata {
          flex-direction: column;
          gap: 8px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  /**
   * Render error message
   */
  renderError(container, message) {
    container.innerHTML = "";
    container.createEl("div", {
      text: message,
      cls: "area-error"
    });
  }
  /**
   * Debug logging
   */
  log(message, ...args) {
    if (this.settings.enableDebugMode) {
      console.log(`[AreaLayoutService] ${message}`, ...args);
    }
  }
};

// src/main.ts
var PrintTitlePlugin = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.customStyleEl = null;
  }
  onload() {
    return __async(this, null, function* () {
      this.log("Loading Print Title Plugin v2.0.0...");
      yield this.loadSettings();
      this.notificationService = new NotificationService(this.settings);
      this.fileAnalysisService = new FileAnalysisService(this.app, this.settings);
      this.dataviewAdapter = new DataviewAdapter(this.app);
      this.areaLayoutService = new AreaLayoutService(this.app, this.settings);
      this.areaCreationService = new AreaCreationService(this.app, this.settings);
      this.buttonService = new ButtonService(this.app, this.settings, this.notificationService, this.fileAnalysisService, this.areaCreationService, this.dataviewAdapter);
      this.viewManager = new ViewManager(this.app, this.buttonService, this.settings, this.areaLayoutService);
      this.addSettingTab(new PrintTitleSettingTab(this.app, this));
      this.registerEventHandlers();
      this.applyCustomStyles();
      setTimeout(() => {
        this.log("Adding buttons to existing notes");
        this.viewManager.addButtonToAllViews();
      }, 1e3);
      this.log("Plugin loaded successfully");
    });
  }
  onunload() {
    var _a;
    this.log("Unloading Print Title Plugin...");
    (_a = this.viewManager) == null ? void 0 : _a.cleanup();
    if (this.customStyleEl) {
      this.customStyleEl.remove();
      this.customStyleEl = null;
    }
    this.log("Plugin unloaded");
  }
  /**
   * Register all event handlers
   */
  registerEventHandlers() {
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        this.viewManager.onFileOpen(file);
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.viewManager.onActiveLeafChange(leaf);
      })
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.viewManager.onLayoutChange();
      })
    );
    this.registerEvent(
      this.app.workspace.on("resize", () => {
        setTimeout(() => {
          this.viewManager.refreshAllButtons();
        }, 200);
      })
    );
    this.log("Event handlers registered");
  }
  /**
   * Load plugin settings
   */
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  /**
   * Save plugin settings
   */
  saveSettings() {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f;
      yield this.saveData(this.settings);
      (_a = this.notificationService) == null ? void 0 : _a.updateSettings(this.settings);
      (_b = this.fileAnalysisService) == null ? void 0 : _b.updateSettings(this.settings);
      (_c = this.areaLayoutService) == null ? void 0 : _c.updateSettings(this.settings);
      (_d = this.areaCreationService) == null ? void 0 : _d.updateSettings(this.settings);
      (_e = this.buttonService) == null ? void 0 : _e.updateSettings(this.settings);
      (_f = this.viewManager) == null ? void 0 : _f.updateSettings(this.settings);
      this.log("Settings saved and services updated");
    });
  }
  /**
   * Get default settings
   */
  getDefaultSettings() {
    return __spreadValues({}, DEFAULT_SETTINGS);
  }
  /**
   * Refresh all buttons (used by settings)
   */
  refreshAllButtons() {
    var _a;
    (_a = this.viewManager) == null ? void 0 : _a.refreshAllButtons();
  }
  /**
   * Apply custom CSS styles
   */
  applyCustomStyles() {
    if (this.customStyleEl) {
      this.customStyleEl.remove();
      this.customStyleEl = null;
    }
    if (this.settings.customCSS.trim()) {
      this.customStyleEl = document.createElement("style");
      this.customStyleEl.textContent = `
				/* Print Title Plugin Custom Styles */
				${this.settings.customCSS}
			`;
      document.head.appendChild(this.customStyleEl);
      this.log("Custom styles applied");
    }
    this.applyBaseStyles();
  }
  /**
   * Apply base plugin styles
   */
  applyBaseStyles() {
    const existingStyle = document.querySelector("#print-title-base-styles");
    if (!existingStyle) {
      const styleEl = document.createElement("style");
      styleEl.id = "print-title-base-styles";
      styleEl.textContent = `
				/* Print Title Plugin Base Styles */
				.print-title-container {
					z-index: 10;
				}
				
				.print-title-button {
					font-family: var(--font-interface);
					white-space: nowrap;
					outline: none;
					user-select: none;
					-webkit-user-select: none;
					-moz-user-select: none;
					-ms-user-select: none;
				}
				
				.print-title-button:focus {
					outline: 2px solid var(--interactive-accent);
					outline-offset: 2px;
				}
				
				.print-title-button:active {
					transform: scale(0.95) !important;
				}
				
				/* Responsive adjustments */
				@media (max-width: 768px) {
					.print-title-container {
						margin: 12px 0;
						padding: 6px 16px;
					}
					
					.print-title-button {
						padding: 6px 12px;
						font-size: 12px;
					}
				}
				
				/* High contrast mode support */
				@media (prefers-contrast: high) {
					.print-title-button {
						border-width: 2px;
					}
				}
				
				/* Reduced motion support */
				@media (prefers-reduced-motion: reduce) {
					.print-title-button {
						transition: none;
					}
					
					.print-title-button:hover {
						transform: none;
					}
				}
			`;
      document.head.appendChild(styleEl);
    }
  }
  /**
   * Debug logging
   */
  log(message, ...args) {
    var _a;
    if ((_a = this.settings) == null ? void 0 : _a.enableDebugMode) {
      console.log(`[PrintTitle] ${message}`, ...args);
    }
  }
};
