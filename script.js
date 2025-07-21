class ShieldyBadgeGenerator {
    constructor() {
        this.baseUrl = 'https://img.shields.io/badge/';
        this.staticUrl = 'https://img.shields.io/static/v1';
        this.currentBadgeUrl = '';
        this.currentBadgeType = 'static'; // 'static' or 'dynamic'
        this.favorites = JSON.parse(localStorage.getItem('shieldy-favorites') || '[]');
        this.customLogo = null; // Store uploaded logo as base64
        
        this.initializeTheme();
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTemplates();
        this.initializeDynamicServices();
        this.initializeIconSelector();
        this.initializeFavorites();
        this.initializeCustomLogo();
        this.generateBadge(); // Generate initial badge
    }

    initializeElements() {
        // Input elements
        this.labelInput = document.getElementById('label-text');
        this.messageInput = document.getElementById('message-text');
        this.linkInput = document.getElementById('link-url');
        this.labelColorInput = document.getElementById('label-color');
        this.labelColorText = document.getElementById('label-color-text');
        this.messageColorInput = document.getElementById('message-color');
        this.messageColorText = document.getElementById('message-color-text');
        this.styleSelect = document.getElementById('badge-style');
        this.logoInput = document.getElementById('logo-option');
        this.logoColorInput = document.getElementById('logo-color');
        this.cacheCheckbox = document.getElementById('cache-seconds');
        this.cacheInput = document.getElementById('cache-value');

        // Dynamic badge elements
        this.dynamicServiceSelect = document.getElementById('dynamic-service');
        this.dynamicParams = document.getElementById('dynamic-params');
        this.dynamicExamples = document.getElementById('dynamic-examples');

        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.staticSections = document.querySelectorAll('.static-section');
        this.dynamicSections = document.querySelectorAll('.dynamic-section');

        // Preview elements
        this.badgeImage = document.getElementById('badge-image');
        this.previewPlaceholder = document.getElementById('preview-placeholder');

        // Button elements
        this.generateBtn = document.getElementById('generate-badge');
        this.copyMarkdownBtn = document.getElementById('copy-markdown');
        this.copyHtmlBtn = document.getElementById('copy-html');
        this.copyUrlBtn = document.getElementById('copy-url');
        this.downloadSvgBtn = document.getElementById('download-svg');

        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toast-message');
        
        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeText = this.themeToggle?.querySelector('.theme-text');
        
        // Favorites elements
        this.saveFavoriteBtn = document.getElementById('save-favorite');
        this.clearFavoritesBtn = document.getElementById('clear-favorites');
        this.favoritesList = document.getElementById('favorites-list');
        
        // Custom logo upload elements
        this.logoUploadArea = document.getElementById('logo-upload-area');
        this.logoFileInput = document.getElementById('logo-file-input');
        this.uploadedLogo = document.getElementById('uploaded-logo');
        this.uploadedLogoPreview = document.getElementById('uploaded-logo-preview');
        this.uploadedLogoName = document.getElementById('uploaded-logo-name');
        this.uploadedLogoSize = document.getElementById('uploaded-logo-size');
        this.removeUploadedLogo = document.getElementById('remove-uploaded-logo');
    }

    initializeEventListeners() {
        // Tab switching
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.switchBadgeType(type);
            });
        });

        // Dynamic service selection
        if (this.dynamicServiceSelect) {
            this.dynamicServiceSelect.addEventListener('change', () => {
                this.handleDynamicServiceChange();
            });
        }

        // Real-time updates for static badges
        if (this.labelInput) this.labelInput.addEventListener('input', () => this.generateBadge());
        if (this.messageInput) this.messageInput.addEventListener('input', () => this.generateBadge());
        if (this.linkInput) this.linkInput.addEventListener('input', () => this.generateBadge());
        if (this.styleSelect) this.styleSelect.addEventListener('change', () => this.generateBadge());
        if (this.logoInput) this.logoInput.addEventListener('input', () => this.generateBadge());
        if (this.logoColorInput) this.logoColorInput.addEventListener('input', () => this.generateBadge());

        // Color inputs
        if (this.labelColorInput) {
            this.labelColorInput.addEventListener('input', (e) => {
                if (this.labelColorText) {
                    this.labelColorText.value = e.target.value.substring(1);
                }
                this.generateBadge();
            });
        }

        if (this.labelColorText) {
            this.labelColorText.addEventListener('input', (e) => {
                const color = this.normalizeColor(e.target.value);
                if (color.startsWith('#') && this.labelColorInput) {
                    this.labelColorInput.value = color;
                }
                this.generateBadge();
            });
        }

        if (this.messageColorInput) {
            this.messageColorInput.addEventListener('input', (e) => {
                if (this.messageColorText) {
                    this.messageColorText.value = e.target.value.substring(1);
                }
                this.generateBadge();
            });
        }

        if (this.messageColorText) {
            this.messageColorText.addEventListener('input', (e) => {
                const color = this.normalizeColor(e.target.value);
                if (color.startsWith('#') && this.messageColorInput) {
                    this.messageColorInput.value = color;
                }
                this.generateBadge();
            });
        }

        // Cache checkbox
        if (this.cacheCheckbox) {
            this.cacheCheckbox.addEventListener('change', (e) => {
                if (this.cacheInput) {
                    this.cacheInput.disabled = !e.target.checked;
                }
                this.generateBadge();
            });
        }

        if (this.cacheInput) {
            this.cacheInput.addEventListener('input', () => this.generateBadge());
        }

        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.messageColorText.value = color;
                const normalizedColor = this.normalizeColor(color);
                if (normalizedColor.startsWith('#')) {
                    this.messageColorInput.value = normalizedColor;
                }
                this.generateBadge();
            });
        });

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.currentTarget.classList.contains('dynamic-template')) {
                    const service = e.currentTarget.dataset.service;
                    const params = JSON.parse(e.currentTarget.dataset.params);
                    this.applyDynamicTemplate(service, params);
                } else {
                    const template = e.currentTarget.dataset.template;
                    this.applyTemplate(template);
                }
            });
        });

        // Export buttons
        if (this.generateBtn) this.generateBtn.addEventListener('click', () => this.generateBadge());
        if (this.copyMarkdownBtn) this.copyMarkdownBtn.addEventListener('click', () => this.copyMarkdown());
        if (this.copyHtmlBtn) this.copyHtmlBtn.addEventListener('click', () => this.copyHtml());
        if (this.copyUrlBtn) this.copyUrlBtn.addEventListener('click', () => this.copyUrl());
        if (this.downloadSvgBtn) this.downloadSvgBtn.addEventListener('click', () => this.downloadSvg());
        
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    generateBadge() {
        if (this.currentBadgeType === 'static') {
            this.generateStaticBadge();
        } else {
            this.generateDynamicBadge();
        }
    }

    switchBadgeType(type) {
        this.currentBadgeType = type;
        
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        // Show/hide sections
        this.staticSections.forEach(section => {
            section.classList.toggle('hidden', type !== 'static');
        });
        
        this.dynamicSections.forEach(section => {
            section.classList.toggle('hidden', type !== 'dynamic');
        });
        
        // Generate badge with new type
        this.generateBadge();
    }

    handleDynamicServiceChange() {
        const serviceKey = this.dynamicServiceSelect.value;
        const service = this.dynamicServices[serviceKey];
        
        if (!service) {
            this.dynamicParams.innerHTML = '';
            this.dynamicExamples.innerHTML = '';
            this.dynamicParams.classList.remove('has-content');
            this.generateBadge();
            return;
        }
        
        // Generate parameter form
        let paramsHtml = '<div class="service-info"><i class="fas fa-info-circle"></i>' + service.name + '</div>';
        
        if (service.params.length > 0) {
            const gridClass = service.params.length > 2 ? 'param-grid' : '';
            paramsHtml += `<div class="${gridClass}">`;
            
            service.params.forEach(param => {
                paramsHtml += `
                    <div class="param-group">
                        <label for="param-${param.name}">
                            ${param.label}${param.required ? ' *' : ''}
                        </label>
                        <input type="text" 
                               id="param-${param.name}" 
                               placeholder="${param.placeholder || ''}"
                               ${param.required ? 'required' : ''}>
                        ${param.description ? `<div class="param-description">${param.description}</div>` : ''}
                    </div>
                `;
            });
            
            paramsHtml += '</div>';
        }
        
        this.dynamicParams.innerHTML = paramsHtml;
        this.dynamicParams.classList.add('has-content');
        
        // Add event listeners to new inputs
        service.params.forEach(param => {
            const input = document.getElementById(`param-${param.name}`);
            if (input) {
                input.addEventListener('input', () => this.generateBadge());
            }
        });
        
        // Show example
        this.dynamicExamples.innerHTML = `
            <h4>Example:</h4>
            <div class="example-badge">
                <img src="${service.example}" alt="Example badge" style="max-height: 20px;">
            </div>
        `;
        
        this.generateBadge();
    }

    generateStaticBadge() {
        const label = this.labelInput?.value?.trim() || 'label';
        const message = this.messageInput?.value?.trim() || 'message';
        const labelColor = this.labelColorText?.value?.trim() || '555';
        const messageColor = this.messageColorText?.value?.trim() || 'brightgreen';
        const style = this.styleSelect?.value || 'flat';
        const logo = this.logoInput?.value?.trim() || '';
        const logoColor = this.logoColorInput?.value?.trim() || '';
        const cacheSeconds = this.cacheCheckbox?.checked ? this.cacheInput?.value || '' : '';

        // Encode the text for URL safety
        const encodedLabel = this.encodeText(label);
        const encodedMessage = this.encodeText(message);

        // Build the URL
        let url = `${this.baseUrl}${encodedLabel}-${encodedMessage}-${messageColor}`;

        // Add query parameters
        const params = new URLSearchParams();
        
        if (style && style !== 'flat') {
            params.append('style', style);
        }
        
        if (labelColor && labelColor !== '555') {
            params.append('labelColor', labelColor);
        }
        
        if (this.customLogo) {
            // For custom logos, we'll use logoSvg parameter with base64 data
            params.append('logoSvg', this.customLogo);
        } else if (logo) {
            params.append('logo', logo);
        }
        
        if (logoColor) {
            params.append('logoColor', logoColor);
        }
        
        if (cacheSeconds) {
            params.append('cacheSeconds', cacheSeconds);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        this.currentBadgeUrl = url;
        this.updatePreview(url);
    }

    generateDynamicBadge() {
        const serviceKey = this.dynamicServiceSelect?.value;
        const service = this.dynamicServices?.[serviceKey];

        if (!service) {
            this.currentBadgeUrl = '';
            this.updatePreview('');
            return;
        }

        // Get parameter values
        const paramValues = {};
        let hasRequiredParams = true;

        service.params.forEach(param => {
            const input = document.getElementById(`param-${param.name}`);
            const value = input ? input.value.trim() : '';
            
            if (param.required && !value) {
                hasRequiredParams = false;
            }
            
            paramValues[param.name] = value;
        });

        if (!hasRequiredParams) {
            this.currentBadgeUrl = '';
            this.updatePreview('');
            return;
        }

        // Build dynamic URL
        let url = this.buildDynamicUrl(serviceKey, paramValues);

        // Add common style parameters
        const params = new URLSearchParams();
        const style = this.styleSelect?.value || 'flat';
        const logo = this.logoInput?.value?.trim() || '';
        const logoColor = this.logoColorInput?.value?.trim() || '';
        const messageColor = this.messageColorText?.value?.trim() || '';
        const labelColor = this.labelColorText?.value?.trim() || '';

        if (style && style !== 'flat') {
            params.append('style', style);
        }
        
        if (this.customLogo) {
            params.append('logoSvg', this.customLogo);
        } else if (logo) {
            params.append('logo', logo);
        }
        
        if (logoColor) {
            params.append('logoColor', logoColor);
        }

        if (messageColor && messageColor !== 'brightgreen') {
            params.append('color', messageColor);
        }

        if (labelColor && labelColor !== '555') {
            params.append('labelColor', labelColor);
        }

        if (params.toString()) {
            url += (url.includes('?') ? '&' : '?') + params.toString();
        }

        this.currentBadgeUrl = url;
        this.updatePreview(url);
    }

    buildDynamicUrl(serviceKey, paramValues) {
        const baseUrl = 'https://img.shields.io/';
        
        switch (serviceKey) {
            // GitHub services
            case 'github/followers':
                return `${baseUrl}github/followers/${paramValues.user}`;
            case 'github/stars':
                return `${baseUrl}github/stars/${paramValues.user}/${paramValues.repo}`;
            case 'github/forks':
                return `${baseUrl}github/forks/${paramValues.user}/${paramValues.repo}`;
            case 'github/watchers':
                return `${baseUrl}github/watchers/${paramValues.user}/${paramValues.repo}`;
            case 'github/issues':
                return `${baseUrl}github/issues/${paramValues.user}/${paramValues.repo}`;
            case 'github/issues-pr':
                return `${baseUrl}github/issues-pr/${paramValues.user}/${paramValues.repo}`;
            case 'github/release':
                return `${baseUrl}github/v/release/${paramValues.user}/${paramValues.repo}`;
            case 'github/tag':
                return `${baseUrl}github/v/tag/${paramValues.user}/${paramValues.repo}`;
            case 'github/commits-since':
                return `${baseUrl}github/commits-since/${paramValues.user}/${paramValues.repo}/${paramValues.version}`;
            case 'github/last-commit':
                return `${baseUrl}github/last-commit/${paramValues.user}/${paramValues.repo}`;
            case 'github/license':
                return `${baseUrl}github/license/${paramValues.user}/${paramValues.repo}`;
            case 'github/languages/top':
                return `${baseUrl}github/languages/top/${paramValues.user}/${paramValues.repo}`;
            case 'github/repo-size':
                return `${baseUrl}github/repo-size/${paramValues.user}/${paramValues.repo}`;
            case 'github/downloads':
                if (paramValues.tag) {
                    return `${baseUrl}github/downloads/${paramValues.user}/${paramValues.repo}/${paramValues.tag}/total`;
                }
                return `${baseUrl}github/downloads/${paramValues.user}/${paramValues.repo}/total`;
            case 'github/workflow/status':
                return `${baseUrl}github/workflow/status/${paramValues.user}/${paramValues.repo}/${paramValues.workflow}`;

            // NPM services
            case 'npm/v':
                return `${baseUrl}npm/v/${paramValues.package}`;
            case 'npm/dt':
                return `${baseUrl}npm/dt/${paramValues.package}`;
            case 'npm/dm':
                return `${baseUrl}npm/dm/${paramValues.package}`;
            case 'npm/dw':
                return `${baseUrl}npm/dw/${paramValues.package}`;
            case 'npm/dy':
                return `${baseUrl}npm/dy/${paramValues.package}`;
            case 'npm/l':
                return `${baseUrl}npm/l/${paramValues.package}`;
            case 'npm/node':
                return `${baseUrl}node/v/${paramValues.package}`;
            case 'npm/types':
                return `${baseUrl}npm/types/${paramValues.package}`;

            // NuGet services
            case 'nuget/v':
                return `${baseUrl}nuget/v/${paramValues.package}`;
            case 'nuget/dt':
                return `${baseUrl}nuget/dt/${paramValues.package}`;
            case 'nuget/vpre':
                return `${baseUrl}nuget/vpre/${paramValues.package}`;

            // PyPI services
            case 'pypi/v':
                return `${baseUrl}pypi/v/${paramValues.package}`;
            case 'pypi/dm':
                return `${baseUrl}pypi/dm/${paramValues.package}`;
            case 'pypi/dw':
                return `${baseUrl}pypi/dw/${paramValues.package}`;
            case 'pypi/dd':
                return `${baseUrl}pypi/dd/${paramValues.package}`;
            case 'pypi/l':
                return `${baseUrl}pypi/l/${paramValues.package}`;
            case 'pypi/pyversions':
                return `${baseUrl}pypi/pyversions/${paramValues.package}`;
            case 'pypi/status':
                return `${baseUrl}pypi/status/${paramValues.package}`;
            case 'pypi/wheel':
                return `${baseUrl}pypi/wheel/${paramValues.package}`;

            // Docker services
            case 'docker/pulls':
                return `${baseUrl}docker/pulls/${paramValues.image}`;
            case 'docker/stars':
                return `${baseUrl}docker/stars/${paramValues.image}`;
            case 'docker/automated':
                return `${baseUrl}docker/automated/${paramValues.image}`;
            case 'docker/build':
                return `${baseUrl}docker/build/${paramValues.image}`;

            // Social services
            case 'twitter/follow':
                return `${baseUrl}twitter/follow/${paramValues.user}`;
            case 'reddit/subreddit-subscribers':
                return `${baseUrl}reddit/subreddit-subscribers/${paramValues.subreddit}`;
            case 'youtube/channel/subscribers':
                return `${baseUrl}youtube/channel/subscribers/${paramValues.channelId}`;
            case 'youtube/channel/views':
                return `${baseUrl}youtube/channel/views/${paramValues.channelId}`;
            case 'discord':
                return `${baseUrl}discord/${paramValues.serverId}`;

            // CI/CD services
            case 'travis':
                return `${baseUrl}travis/${paramValues.user}/${paramValues.repo}`;
            case 'circleci/build':
                return `${baseUrl}circleci/build/${paramValues.vcs}/${paramValues.user}/${paramValues.repo}`;
            case 'appveyor/ci':
                return `${baseUrl}appveyor/ci/${paramValues.user}/${paramValues.repo}`;
            case 'gitlab/pipeline':
                return `${baseUrl}gitlab/pipeline/${paramValues.user}/${paramValues.repo}`;

            // Code Quality services
            case 'codecov/c':
                return `${baseUrl}codecov/c/${paramValues.vcs}/${paramValues.user}/${paramValues.repo}`;
            case 'coveralls':
                return `${baseUrl}coveralls/${paramValues.vcs}/${paramValues.user}/${paramValues.repo}`;
            case 'codeclimate/maintainability':
                return `${baseUrl}codeclimate/maintainability/${paramValues.user}/${paramValues.repo}`;
            case 'codeclimate/tech-debt':
                return `${baseUrl}codeclimate/tech-debt/${paramValues.user}/${paramValues.repo}`;
            case 'scrutinizer/g':
                return `${baseUrl}scrutinizer/${paramValues.vcs}/${paramValues.user}/${paramValues.repo}`;
            case 'sonar/quality_gate':
                if (paramValues.server) {
                    return `${baseUrl}sonar/quality_gate/${paramValues.project}?server=${encodeURIComponent(paramValues.server)}`;
                }
                return `${baseUrl}sonar/quality_gate/${paramValues.project}`;

            // Security services
            case 'snyk/vulnerabilities':
                return `${baseUrl}snyk/vulnerabilities/${paramValues.vcs}/${paramValues.user}/${paramValues.repo}`;
            case 'librariesio/dependents':
                return `${baseUrl}librariesio/dependents/${paramValues.platform}/${paramValues.package}`;

            default:
                return baseUrl + serviceKey;
        }
    }

    initializeTemplates() {
        this.templates = {
            'build-passing': {
                label: 'build',
                message: 'passing',
                messageColor: 'brightgreen',
                style: 'flat'
            },
            'version': {
                label: 'version',
                message: '1.0.0',
                messageColor: 'blue',
                style: 'flat'
            },
            'license': {
                label: 'license',
                message: 'MIT',
                messageColor: 'green',
                style: 'flat'
            },
            'coverage': {
                label: 'coverage',
                message: '95%',
                messageColor: 'brightgreen',
                style: 'flat'
            },
            'docs': {
                label: 'docs',
                message: 'latest',
                messageColor: 'blue',
                style: 'flat'
            },
            'status': {
                label: 'status',
                message: 'active',
                messageColor: 'success',
                style: 'flat'
            }
        };
    }

    initializeDynamicServices() {
        this.dynamicServices = {
            // GitHub services
            'github/followers': {
                name: 'GitHub Followers',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'octocat', required: true, description: 'GitHub username' }
                ],
                example: 'https://img.shields.io/github/followers/octocat?style=social'
            },
            'github/stars': {
                name: 'GitHub Stars',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'facebook', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'react', required: true }
                ],
                example: 'https://img.shields.io/github/stars/facebook/react'
            },
            'github/forks': {
                name: 'GitHub Forks',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'microsoft', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'vscode', required: true }
                ],
                example: 'https://img.shields.io/github/forks/microsoft/vscode'
            },
            'github/watchers': {
                name: 'GitHub Watchers',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'angular', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'angular', required: true }
                ],
                example: 'https://img.shields.io/github/watchers/angular/angular'
            },
            'github/issues': {
                name: 'GitHub Issues',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'vuejs', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'vue', required: true }
                ],
                example: 'https://img.shields.io/github/issues/vuejs/vue'
            },
            'github/issues-pr': {
                name: 'GitHub Pull Requests',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'webpack', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'webpack', required: true }
                ],
                example: 'https://img.shields.io/github/issues-pr/webpack/webpack'
            },
            'github/release': {
                name: 'GitHub Release',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'nodejs', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'node', required: true }
                ],
                example: 'https://img.shields.io/github/v/release/nodejs/node'
            },
            'github/tag': {
                name: 'GitHub Tag',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'jquery', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'jquery', required: true }
                ],
                example: 'https://img.shields.io/github/v/tag/jquery/jquery'
            },
            'github/commits-since': {
                name: 'GitHub Commits Since',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'rails', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'rails', required: true },
                    { name: 'version', label: 'Version/Tag', placeholder: 'v7.0.0', required: true }
                ],
                example: 'https://img.shields.io/github/commits-since/rails/rails/v7.0.0'
            },
            'github/last-commit': {
                name: 'GitHub Last Commit',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'torvalds', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'linux', required: true }
                ],
                example: 'https://img.shields.io/github/last-commit/torvalds/linux'
            },
            'github/license': {
                name: 'GitHub License',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'twbs', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'bootstrap', required: true }
                ],
                example: 'https://img.shields.io/github/license/twbs/bootstrap'
            },
            'github/languages/top': {
                name: 'GitHub Top Language',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'expressjs', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'express', required: true }
                ],
                example: 'https://img.shields.io/github/languages/top/expressjs/express'
            },
            'github/repo-size': {
                name: 'GitHub Repo Size',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'atom', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'atom', required: true }
                ],
                example: 'https://img.shields.io/github/repo-size/atom/atom'
            },
            'github/downloads': {
                name: 'GitHub Downloads',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'atom', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'atom', required: true },
                    { name: 'tag', label: 'Tag (optional)', placeholder: 'latest', required: false }
                ],
                example: 'https://img.shields.io/github/downloads/atom/atom/total'
            },

            // NPM services
            'npm/v': {
                name: 'NPM Version',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'react', required: true, description: 'NPM package name' }
                ],
                example: 'https://img.shields.io/npm/v/react'
            },
            'npm/dt': {
                name: 'NPM Downloads Total',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'lodash', required: true }
                ],
                example: 'https://img.shields.io/npm/dt/lodash'
            },
            'npm/dm': {
                name: 'NPM Downloads Monthly',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'express', required: true }
                ],
                example: 'https://img.shields.io/npm/dm/express'
            },
            'npm/dw': {
                name: 'NPM Downloads Weekly',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'webpack', required: true }
                ],
                example: 'https://img.shields.io/npm/dw/webpack'
            },
            'npm/dy': {
                name: 'NPM Downloads Yearly',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'axios', required: true }
                ],
                example: 'https://img.shields.io/npm/dy/axios'
            },
            'npm/l': {
                name: 'NPM License',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'vue', required: true }
                ],
                example: 'https://img.shields.io/npm/l/vue'
            },
            'npm/node': {
                name: 'NPM Node Version',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'typescript', required: true }
                ],
                example: 'https://img.shields.io/node/v/typescript'
            },
            'npm/types': {
                name: 'NPM Types',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'react', required: true }
                ],
                example: 'https://img.shields.io/npm/types/react'
            },

            // NuGet services
            'nuget/v': {
                name: 'NuGet Version',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'Newtonsoft.Json', required: true, description: 'NuGet package name' }
                ],
                example: 'https://img.shields.io/nuget/v/Newtonsoft.Json'
            },
            'nuget/dt': {
                name: 'NuGet Downloads Total',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'EntityFramework', required: true }
                ],
                example: 'https://img.shields.io/nuget/dt/EntityFramework'
            },
            'nuget/vpre': {
                name: 'NuGet Version (Prerelease)',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'Microsoft.AspNetCore', required: true }
                ],
                example: 'https://img.shields.io/nuget/vpre/Microsoft.AspNetCore'
            },

            // PyPI services
            'pypi/v': {
                name: 'PyPI Version',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'django', required: true, description: 'PyPI package name' }
                ],
                example: 'https://img.shields.io/pypi/v/django'
            },
            'pypi/dm': {
                name: 'PyPI Downloads Monthly',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'requests', required: true }
                ],
                example: 'https://img.shields.io/pypi/dm/requests'
            },
            'pypi/dw': {
                name: 'PyPI Downloads Weekly',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'flask', required: true }
                ],
                example: 'https://img.shields.io/pypi/dw/flask'
            },
            'pypi/dd': {
                name: 'PyPI Downloads Daily',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'numpy', required: true }
                ],
                example: 'https://img.shields.io/pypi/dd/numpy'
            },
            'pypi/l': {
                name: 'PyPI License',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'tensorflow', required: true }
                ],
                example: 'https://img.shields.io/pypi/l/tensorflow'
            },
            'pypi/pyversions': {
                name: 'PyPI Python Versions',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'pandas', required: true }
                ],
                example: 'https://img.shields.io/pypi/pyversions/pandas'
            },
            'pypi/status': {
                name: 'PyPI Status',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'scikit-learn', required: true }
                ],
                example: 'https://img.shields.io/pypi/status/scikit-learn'
            },
            'pypi/wheel': {
                name: 'PyPI Wheel',
                params: [
                    { name: 'package', label: 'Package Name', placeholder: 'matplotlib', required: true }
                ],
                example: 'https://img.shields.io/pypi/wheel/matplotlib'
            },

            // Docker services
            'docker/pulls': {
                name: 'Docker Pulls',
                params: [
                    { name: 'image', label: 'Image Name', placeholder: 'nginx', required: true, description: 'Docker Hub image name' }
                ],
                example: 'https://img.shields.io/docker/pulls/nginx'
            },
            'docker/stars': {
                name: 'Docker Stars',
                params: [
                    { name: 'image', label: 'Image Name', placeholder: 'alpine', required: true }
                ],
                example: 'https://img.shields.io/docker/stars/alpine'
            },
            'docker/automated': {
                name: 'Docker Automated',
                params: [
                    { name: 'image', label: 'Image Name', placeholder: 'jwilder/nginx-proxy', required: true }
                ],
                example: 'https://img.shields.io/docker/automated/jwilder/nginx-proxy'
            },
            'docker/build': {
                name: 'Docker Build',
                params: [
                    { name: 'image', label: 'Image Name', placeholder: 'jwilder/nginx-proxy', required: true }
                ],
                example: 'https://img.shields.io/docker/build/jwilder/nginx-proxy'
            },

            // Social services
            'twitter/follow': {
                name: 'Twitter Follow',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'github', required: true, description: 'Twitter username (without @)' }
                ],
                example: 'https://img.shields.io/twitter/follow/github?style=social'
            },
            'reddit/subreddit-subscribers': {
                name: 'Reddit Subscribers',
                params: [
                    { name: 'subreddit', label: 'Subreddit', placeholder: 'programming', required: true }
                ],
                example: 'https://img.shields.io/reddit/subreddit-subscribers/programming'
            },
            'youtube/channel/subscribers': {
                name: 'YouTube Subscribers',
                params: [
                    { name: 'channelId', label: 'Channel ID', placeholder: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', required: true, description: 'YouTube channel ID' }
                ],
                example: 'https://img.shields.io/youtube/channel/subscribers/UC_x5XG1OV2P6uZZ5FSM9Ttw'
            },
            'youtube/channel/views': {
                name: 'YouTube Views',
                params: [
                    { name: 'channelId', label: 'Channel ID', placeholder: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', required: true }
                ],
                example: 'https://img.shields.io/youtube/channel/views/UC_x5XG1OV2P6uZZ5FSM9Ttw'
            },
            'discord': {
                name: 'Discord',
                params: [
                    { name: 'serverId', label: 'Server ID', placeholder: '102860784329052160', required: true, description: 'Discord server ID' }
                ],
                example: 'https://img.shields.io/discord/102860784329052160'
            },

            // CI/CD services
            'travis': {
                name: 'Travis CI',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'rails', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'rails', required: true }
                ],
                example: 'https://img.shields.io/travis/rails/rails'
            },
            'circleci/build': {
                name: 'CircleCI',
                params: [
                    { name: 'vcs', label: 'VCS', placeholder: 'github', required: true },
                    { name: 'user', label: 'Username', placeholder: 'facebook', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'react', required: true }
                ],
                example: 'https://img.shields.io/circleci/build/github/facebook/react'
            },
            'appveyor/ci': {
                name: 'AppVeyor',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'gruntjs', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'grunt', required: true }
                ],
                example: 'https://img.shields.io/appveyor/ci/gruntjs/grunt'
            },
            'gitlab/pipeline': {
                name: 'GitLab Pipeline',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'gitlab-org', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'gitlab', required: true }
                ],
                example: 'https://img.shields.io/gitlab/pipeline/gitlab-org/gitlab'
            },
            'github/workflow/status': {
                name: 'GitHub Actions',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'actions', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'setup-node', required: true },
                    { name: 'workflow', label: 'Workflow Name', placeholder: 'CI', required: true }
                ],
                example: 'https://img.shields.io/github/workflow/status/actions/setup-node/CI'
            },

            // Code Quality services
            'codecov/c': {
                name: 'Codecov Coverage',
                params: [
                    { name: 'vcs', label: 'VCS', placeholder: 'github', required: true, description: 'Version control system (github, gitlab, bitbucket)' },
                    { name: 'user', label: 'Username', placeholder: 'codecov', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'codecov-python', required: true }
                ],
                example: 'https://img.shields.io/codecov/c/github/codecov/codecov-python'
            },
            'coveralls': {
                name: 'Coveralls',
                params: [
                    { name: 'vcs', label: 'VCS', placeholder: 'github', required: true },
                    { name: 'user', label: 'Username', placeholder: 'lemurheavy', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'coveralls-ruby', required: true }
                ],
                example: 'https://img.shields.io/coveralls/github/lemurheavy/coveralls-ruby'
            },
            'codeclimate/maintainability': {
                name: 'Code Climate Maintainability',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'codeclimate', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'codeclimate', required: true }
                ],
                example: 'https://img.shields.io/codeclimate/maintainability/codeclimate/codeclimate'
            },
            'codeclimate/tech-debt': {
                name: 'Code Climate Tech Debt',
                params: [
                    { name: 'user', label: 'Username', placeholder: 'codeclimate', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'codeclimate', required: true }
                ],
                example: 'https://img.shields.io/codeclimate/tech-debt/codeclimate/codeclimate'
            },
            'scrutinizer/g': {
                name: 'Scrutinizer',
                params: [
                    { name: 'vcs', label: 'VCS', placeholder: 'g', required: true },
                    { name: 'user', label: 'Username', placeholder: 'phpdocumentor', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'phpdocumentor2', required: true }
                ],
                example: 'https://img.shields.io/scrutinizer/g/phpdocumentor/phpdocumentor2'
            },
            'sonar/quality_gate': {
                name: 'SonarQube Quality Gate',
                params: [
                    { name: 'project', label: 'Project Key', placeholder: 'my-project', required: true },
                    { name: 'server', label: 'Server URL', placeholder: 'https://sonarcloud.io', required: false }
                ],
                example: 'https://img.shields.io/sonar/quality_gate/my-project'
            },

            // Security services
            'snyk/vulnerabilities': {
                name: 'Snyk Vulnerabilities',
                params: [
                    { name: 'vcs', label: 'VCS', placeholder: 'github', required: true },
                    { name: 'user', label: 'Username', placeholder: 'snyk', required: true },
                    { name: 'repo', label: 'Repository', placeholder: 'goof', required: true }
                ],
                example: 'https://img.shields.io/snyk/vulnerabilities/github/snyk/goof'
            },
            'librariesio/dependents': {
                name: 'Libraries.io Dependents',
                params: [
                    { name: 'platform', label: 'Platform', placeholder: 'npm', required: true },
                    { name: 'package', label: 'Package Name', placeholder: 'express', required: true }
                ],
                example: 'https://img.shields.io/librariesio/dependents/npm/express'
            }
        };
    }

    initializeIconSelector() {
        // Icon data organized by categories
        this.iconData = {
            popular: [
                { name: 'github', display: 'GitHub' },
                { name: 'npm', display: 'NPM' },
                { name: 'docker', display: 'Docker' },
                { name: 'javascript', display: 'JavaScript' },
                { name: 'python', display: 'Python' },
                { name: 'node-dot-js', display: 'Node.js' },
                { name: 'react', display: 'React' },
                { name: 'vue-dot-js', display: 'Vue.js' },
                { name: 'angular', display: 'Angular' },
                { name: 'typescript', display: 'TypeScript' },
                { name: 'java', display: 'Java' },
                { name: 'go', display: 'Go' },
                { name: 'rust', display: 'Rust' },
                { name: 'php', display: 'PHP' },
                { name: 'ruby', display: 'Ruby' },
                { name: 'swift', display: 'Swift' }
            ],
            tech: [
                { name: 'kubernetes', display: 'Kubernetes' },
                { name: 'terraform', display: 'Terraform' },
                { name: 'jenkins', display: 'Jenkins' },
                { name: 'gitlab', display: 'GitLab' },
                { name: 'circleci', display: 'CircleCI' },
                { name: 'travis-ci', display: 'Travis CI' },
                { name: 'apache', display: 'Apache' },
                { name: 'nginx', display: 'Nginx' },
                { name: 'redis', display: 'Redis' },
                { name: 'mongodb', display: 'MongoDB' },
                { name: 'mysql', display: 'MySQL' },
                { name: 'postgresql', display: 'PostgreSQL' },
                { name: 'elasticsearch', display: 'Elasticsearch' },
                { name: 'grafana', display: 'Grafana' },
                { name: 'prometheus', display: 'Prometheus' },
                { name: 'ansible', display: 'Ansible' }
            ],
            social: [
                { name: 'twitter', display: 'Twitter' },
                { name: 'linkedin', display: 'LinkedIn' },
                { name: 'facebook', display: 'Facebook' },
                { name: 'instagram', display: 'Instagram' },
                { name: 'youtube', display: 'YouTube' },
                { name: 'discord', display: 'Discord' },
                { name: 'slack', display: 'Slack' },
                { name: 'telegram', display: 'Telegram' },
                { name: 'whatsapp', display: 'WhatsApp' },
                { name: 'reddit', display: 'Reddit' },
                { name: 'stackoverflow', display: 'Stack Overflow' },
                { name: 'medium', display: 'Medium' },
                { name: 'dev-dot-to', display: 'Dev.to' },
                { name: 'hashnode', display: 'Hashnode' }
            ],
            tools: [
                { name: 'visual-studio-code', display: 'VS Code' },
                { name: 'intellij-idea', display: 'IntelliJ IDEA' },
                { name: 'sublime-text', display: 'Sublime Text' },
                { name: 'atom', display: 'Atom' },
                { name: 'vim', display: 'Vim' },
                { name: 'emacs', display: 'Emacs' },
                { name: 'git', display: 'Git' },
                { name: 'figma', display: 'Figma' },
                { name: 'sketch', display: 'Sketch' },
                { name: 'adobe-photoshop', display: 'Photoshop' },
                { name: 'postman', display: 'Postman' },
                { name: 'insomnia', display: 'Insomnia' },
                { name: 'jira', display: 'Jira' },
                { name: 'notion', display: 'Notion' },
                { name: 'confluence', display: 'Confluence' }
            ],
            brands: [
                { name: 'microsoft', display: 'Microsoft' },
                { name: 'google', display: 'Google' },
                { name: 'amazon', display: 'Amazon' },
                { name: 'apple', display: 'Apple' },
                { name: 'netflix', display: 'Netflix' },
                { name: 'spotify', display: 'Spotify' },
                { name: 'adobe', display: 'Adobe' },
                { name: 'atlassian', display: 'Atlassian' },
                { name: 'jetbrains', display: 'JetBrains' },
                { name: 'digitalocean', display: 'DigitalOcean' },
                { name: 'heroku', display: 'Heroku' },
                { name: 'vercel', display: 'Vercel' },
                { name: 'netlify', display: 'Netlify' },
                { name: 'cloudflare', display: 'Cloudflare' }
            ]
        };

        // Modal elements
        this.iconModal = document.getElementById('icon-modal-overlay');
        this.iconGrid = document.getElementById('icon-grid');
        this.iconSearchInput = document.getElementById('icon-search-input');
        this.categoryButtons = document.querySelectorAll('.category-btn');
        this.applyIconBtn = document.getElementById('apply-icon');
        this.clearIconBtn = document.getElementById('clear-icon');
        this.closeModalBtn = document.getElementById('close-icon-modal');
        this.openIconSelectorBtn = document.getElementById('open-icon-selector');

        this.selectedIcon = null;
        this.currentCategory = 'popular';

        this.setupIconSelectorEvents();
        this.renderIcons();
    }

    setupIconSelectorEvents() {
        // Open modal
        this.openIconSelectorBtn.addEventListener('click', () => {
            this.openIconModal();
        });

        // Close modal
        this.closeModalBtn.addEventListener('click', () => {
            this.closeIconModal();
        });

        // Close modal on overlay click
        this.iconModal.addEventListener('click', (e) => {
            if (e.target === this.iconModal) {
                this.closeIconModal();
            }
        });

        // Search functionality
        this.iconSearchInput.addEventListener('input', (e) => {
            this.filterIcons(e.target.value);
        });

        // Category buttons
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Apply selected icon
        this.applyIconBtn.addEventListener('click', () => {
            if (this.selectedIcon) {
                this.logoInput.value = this.selectedIcon;
                this.generateBadge();
                this.closeIconModal();
                this.showToast('Icon applied successfully!');
            }
        });

        // Clear icon
        this.clearIconBtn.addEventListener('click', () => {
            this.logoInput.value = '';
            this.generateBadge();
            this.closeIconModal();
            this.showToast('Icon cleared!');
        });

        // Keyboard shortcuts in modal
        document.addEventListener('keydown', (e) => {
            if (this.iconModal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeIconModal();
                } else if (e.key === 'Enter' && this.selectedIcon) {
                    this.applyIconBtn.click();
                }
            }
        });
    }

    openIconModal() {
        this.iconModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.iconSearchInput.focus();
        
        // Pre-select current logo if it exists
        const currentLogo = this.logoInput.value.trim();
        if (currentLogo) {
            this.selectedIcon = currentLogo;
            this.updateApplyButton();
        }
    }

    closeIconModal() {
        this.iconModal.classList.remove('active');
        document.body.style.overflow = '';
        this.selectedIcon = null;
        this.iconSearchInput.value = '';
        this.updateApplyButton();
        this.renderIcons();
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update category buttons
        this.categoryButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Clear search
        this.iconSearchInput.value = '';
        this.renderIcons();
    }

    renderIcons(searchTerm = '') {
        const icons = this.iconData[this.currentCategory] || [];
        const filteredIcons = searchTerm 
            ? icons.filter(icon => 
                icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                icon.display.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : icons;

        if (filteredIcons.length === 0) {
            this.iconGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>No icons found</p>
                </div>
            `;
            return;
        }

        this.iconGrid.innerHTML = filteredIcons.map(icon => `
            <div class="icon-item" data-icon="${icon.name}" title="${icon.display}">
                <div class="icon-preview">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${icon.name}.svg" 
                         alt="${icon.display}" 
                         style="width: 1.8rem; height: 1.8rem; filter: brightness(0.3);"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <i class="fas fa-cube" style="font-size: 1.8rem; display: none; color: #6c757d;"></i>
                </div>
                <span class="icon-name">${icon.display}</span>
            </div>
        `).join('');

        // Add click events to icon items
        this.iconGrid.querySelectorAll('.icon-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectIcon(e.currentTarget);
            });
        });

        // Highlight currently selected icon
        if (this.selectedIcon) {
            const selectedItem = this.iconGrid.querySelector(`[data-icon="${this.selectedIcon}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }
        }
    }

    selectIcon(iconElement) {
        // Remove previous selection
        this.iconGrid.querySelectorAll('.icon-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Select new icon
        iconElement.classList.add('selected');
        this.selectedIcon = iconElement.dataset.icon;
        this.updateApplyButton();
    }

    updateApplyButton() {
        this.applyIconBtn.disabled = !this.selectedIcon;
        if (this.selectedIcon) {
            this.applyIconBtn.textContent = `Apply "${this.selectedIcon}"`;
        } else {
            this.applyIconBtn.textContent = 'Apply Selected Icon';
        }
    }

    filterIcons(searchTerm) {
        this.renderIcons(searchTerm);
    }

    normalizeColor(color) {
        // Color name mappings
        const colorMap = {
            'brightgreen': '#4c1',
            'green': '#4c1',
            'yellow': '#dfb317',
            'orange': '#fe7d37',
            'red': '#e05d44',
            'blue': '#007ec6',
            'lightgrey': '#9f9f9f',
            'success': '#4c1',
            'important': '#fe7d37',
            'critical': '#e05d44',
            'informational': '#007ec6',
            'inactive': '#9f9f9f'
        };

        if (colorMap[color]) {
            return colorMap[color];
        }

        // If it's already a hex color, return as is
        if (/^#?[0-9A-Fa-f]{3,6}$/.test(color)) {
            return color.startsWith('#') ? color : '#' + color;
        }

        // Return the original color for shields.io named colors
        return color;
    }

    encodeText(text) {
        return text
            .replace(/-/g, '--')
            .replace(/_/g, '__')
            .replace(/ /g, '_');
    }

    updatePreview(url) {
        if (!url) {
            this.badgeImage.style.display = 'none';
            this.previewPlaceholder.style.display = 'block';
            return;
        }

        this.badgeImage.src = url;
        this.badgeImage.style.display = 'block';
        this.previewPlaceholder.style.display = 'none';

        // Handle image load error
        this.badgeImage.onerror = () => {
            this.badgeImage.style.display = 'none';
            this.previewPlaceholder.style.display = 'block';
        };
    }

    applyTemplate(templateName) {
        const template = this.templates[templateName];
        if (!template) return;

        // Switch to static mode for templates
        if (this.currentBadgeType !== 'static') {
            this.switchBadgeType('static');
        }

        this.labelInput.value = template.label;
        this.messageInput.value = template.message;
        this.messageColorText.value = template.messageColor;
        this.styleSelect.value = template.style;

        // Update color picker if it's a hex color
        const normalizedColor = this.normalizeColor(template.messageColor);
        if (normalizedColor.startsWith('#')) {
            this.messageColorInput.value = normalizedColor;
        }

        this.generateBadge();
    }

    applyDynamicTemplate(serviceKey, params) {
        // Switch to dynamic mode
        if (this.currentBadgeType !== 'dynamic') {
            this.switchBadgeType('dynamic');
        }

        // Set the service
        this.dynamicServiceSelect.value = serviceKey;
        this.handleDynamicServiceChange();

        // Wait a bit for the form to be generated, then set the values
        setTimeout(() => {
            Object.keys(params).forEach(paramName => {
                const input = document.getElementById(`param-${paramName}`);
                if (input) {
                    input.value = params[paramName];
                }
            });
            
            // Generate the badge with the new parameters
            this.generateBadge();
        }, 100);
    }

    copyMarkdown() {
        const link = this.linkInput.value.trim();
        let markdown;
        
        if (link) {
            markdown = `[![Badge](${this.currentBadgeUrl})](${link})`;
        } else {
            markdown = `![Badge](${this.currentBadgeUrl})`;
        }
        
        this.copyToClipboard(markdown, 'Markdown copied to clipboard!');
    }

    copyHtml() {
        const link = this.linkInput.value.trim();
        let html;
        
        if (link) {
            html = `<a href="${link}"><img src="${this.currentBadgeUrl}" alt="Badge"></a>`;
        } else {
            html = `<img src="${this.currentBadgeUrl}" alt="Badge">`;
        }
        
        this.copyToClipboard(html, 'HTML copied to clipboard!');
    }

    copyUrl() {
        this.copyToClipboard(this.currentBadgeUrl, 'URL copied to clipboard!');
    }

    async downloadSvg() {
        try {
            const svgUrl = this.currentBadgeUrl + (this.currentBadgeUrl.includes('?') ? '&' : '?') + 'format=svg';
            const response = await fetch(svgUrl);
            const svgContent = await response.text();
            
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'badge.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('SVG downloaded!');
        } catch (error) {
            console.error('Error downloading SVG:', error);
            this.showToast('Error downloading SVG', 'error');
        }
    }

    async copyToClipboard(text, successMessage) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast(successMessage);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showToast(successMessage);
            } catch (fallbackError) {
                this.showToast('Error copying to clipboard', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        
        // Update toast styling based on type
        if (type === 'error') {
            this.toast.style.background = '#dc3545';
        } else {
            this.toast.style.background = '#28a745';
        }
        
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('shieldy-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('shieldy-theme', newTheme);
        this.updateThemeToggle(newTheme);
        this.showToast(`Switched to ${newTheme} theme`);
    }

    updateThemeToggle(theme) {
        if (this.themeText) {
            this.themeText.textContent = theme === 'dark' ? 'Light' : 'Dark';
        }
    }

    // Favorites Management
    initializeFavorites() {
        this.renderFavorites();
        
        if (this.saveFavoriteBtn) {
            this.saveFavoriteBtn.addEventListener('click', () => this.saveFavorite());
        }
        
        if (this.clearFavoritesBtn) {
            this.clearFavoritesBtn.addEventListener('click', () => this.clearAllFavorites());
        }
    }

    saveFavorite() {
        if (!this.currentBadgeUrl) {
            this.showToast('Generate a badge first!', 'error');
            return;
        }

        const favorite = {
            id: Date.now(),
            name: this.generateFavoriteName(),
            type: this.currentBadgeType,
            url: this.currentBadgeUrl,
            config: this.getCurrentConfig(),
            created: new Date().toISOString()
        };

        // Check if already exists
        const exists = this.favorites.some(f => f.url === favorite.url);
        if (exists) {
            this.showToast('Badge already in favorites!', 'error');
            return;
        }

        this.favorites.unshift(favorite);
        
        // Limit to 20 favorites
        if (this.favorites.length > 20) {
            this.favorites = this.favorites.slice(0, 20);
        }
        
        this.saveFavoritesToStorage();
        this.renderFavorites();
        this.showToast('Badge saved to favorites!');
    }

    generateFavoriteName() {
        if (this.currentBadgeType === 'static') {
            const label = this.labelInput?.value || 'label';
            const message = this.messageInput?.value || 'message';
            return `${label}-${message}`;
        } else {
            const service = this.dynamicServiceSelect?.value || 'dynamic';
            return service.replace(/[^a-zA-Z0-9]/g, '-');
        }
    }

    getCurrentConfig() {
        const config = {
            type: this.currentBadgeType
        };

        if (this.currentBadgeType === 'static') {
            config.label = this.labelInput?.value || '';
            config.message = this.messageInput?.value || '';
            config.labelColor = this.labelColorText?.value || '';
            config.messageColor = this.messageColorText?.value || '';
            config.style = this.styleSelect?.value || '';
            config.logo = this.logoInput?.value || '';
            config.logoColor = this.logoColorInput?.value || '';
            config.link = this.linkInput?.value || '';
        } else {
            config.service = this.dynamicServiceSelect?.value || '';
            // Get dynamic parameters
            config.params = {};
            const service = this.dynamicServices[config.service];
            if (service) {
                service.params.forEach(param => {
                    const input = document.getElementById(`param-${param.name}`);
                    if (input) {
                        config.params[param.name] = input.value;
                    }
                });
            }
        }

        return config;
    }

    loadFavorite(favorite) {
        if (favorite.type !== this.currentBadgeType) {
            this.switchBadgeType(favorite.type);
        }

        // Wait for the tab switch to complete
        setTimeout(() => {
            const config = favorite.config;
            
            if (favorite.type === 'static') {
                if (this.labelInput) this.labelInput.value = config.label || '';
                if (this.messageInput) this.messageInput.value = config.message || '';
                if (this.labelColorText) this.labelColorText.value = config.labelColor || '';
                if (this.messageColorText) this.messageColorText.value = config.messageColor || '';
                if (this.styleSelect) this.styleSelect.value = config.style || '';
                if (this.logoInput) this.logoInput.value = config.logo || '';
                if (this.logoColorInput) this.logoColorInput.value = config.logoColor || '';
                if (this.linkInput) this.linkInput.value = config.link || '';
                
                // Update color pickers
                if (config.labelColor && this.labelColorInput) {
                    const color = this.normalizeColor(config.labelColor);
                    if (color.startsWith('#')) {
                        this.labelColorInput.value = color;
                    }
                }
                
                if (config.messageColor && this.messageColorInput) {
                    const color = this.normalizeColor(config.messageColor);
                    if (color.startsWith('#')) {
                        this.messageColorInput.value = color;
                    }
                }
            } else {
                if (this.dynamicServiceSelect) {
                    this.dynamicServiceSelect.value = config.service || '';
                    this.handleDynamicServiceChange();
                    
                    // Set parameters after form is generated
                    setTimeout(() => {
                        if (config.params) {
                            Object.keys(config.params).forEach(paramName => {
                                const input = document.getElementById(`param-${paramName}`);
                                if (input) {
                                    input.value = config.params[paramName];
                                }
                            });
                        }
                        this.generateBadge();
                    }, 100);
                }
            }
            
            this.generateBadge();
            this.showToast(`Loaded favorite: ${favorite.name}`);
        }, 100);
    }

    deleteFavorite(favoriteId) {
        this.favorites = this.favorites.filter(f => f.id !== favoriteId);
        this.saveFavoritesToStorage();
        this.renderFavorites();
        this.showToast('Favorite deleted');
    }

    clearAllFavorites() {
        if (this.favorites.length === 0) {
            this.showToast('No favorites to clear!', 'error');
            return;
        }

        if (confirm('Are you sure you want to clear all favorites?')) {
            this.favorites = [];
            this.saveFavoritesToStorage();
            this.renderFavorites();
            this.showToast('All favorites cleared');
        }
    }

    saveFavoritesToStorage() {
        localStorage.setItem('shieldy-favorites', JSON.stringify(this.favorites));
    }

    renderFavorites() {
        if (!this.favoritesList) return;

        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-heart-broken"></i>
                    <p>No favorites saved yet</p>
                </div>
            `;
            return;
        }

        this.favoritesList.innerHTML = this.favorites.map(favorite => `
            <div class="favorite-item" data-id="${favorite.id}">
                <div class="favorite-info">
                    <div class="favorite-name" title="${favorite.name}">${favorite.name}</div>
                    <div class="favorite-preview">${favorite.type} • ${new Date(favorite.created).toLocaleDateString()}</div>
                </div>
                <div class="favorite-actions-btn">
                    <button class="favorite-btn load" title="Load this favorite">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="favorite-btn delete" title="Delete this favorite">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        this.favoritesList.querySelectorAll('.favorite-item').forEach(item => {
            const favoriteId = parseInt(item.dataset.id);
            const favorite = this.favorites.find(f => f.id === favoriteId);
            
            item.querySelector('.load').addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadFavorite(favorite);
            });
            
            item.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteFavorite(favoriteId);
            });
            
            // Load on click
            item.addEventListener('click', () => {
                this.loadFavorite(favorite);
            });
        });
    }

    // Custom Logo Upload
    initializeCustomLogo() {
        if (!this.logoUploadArea || !this.logoFileInput) return;

        // Click to upload
        this.logoUploadArea.addEventListener('click', () => {
            this.logoFileInput.click();
        });

        // File input change
        this.logoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleLogoUpload(file);
            }
        });

        // Drag and drop
        this.logoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.logoUploadArea.classList.add('dragover');
        });

        this.logoUploadArea.addEventListener('dragleave', () => {
            this.logoUploadArea.classList.remove('dragover');
        });

        this.logoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.logoUploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleLogoUpload(file);
            } else {
                this.showToast('Please upload an image file', 'error');
            }
        });

        // Remove uploaded logo
        if (this.removeUploadedLogo) {
            this.removeUploadedLogo.addEventListener('click', () => {
                this.removeCustomLogo();
            });
        }
    }

    handleLogoUpload(file) {
        // Check file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            this.showToast('File size must be less than 2MB', 'error');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.customLogo = e.target.result;
            this.displayUploadedLogo(file, e.target.result);
            
            // Clear the text input and use custom logo
            if (this.logoInput) {
                this.logoInput.value = '';
            }
            
            this.generateBadge();
            this.showToast('Custom logo uploaded successfully!');
        };

        reader.onerror = () => {
            this.showToast('Error reading file', 'error');
        };

        reader.readAsDataURL(file);
    }

    displayUploadedLogo(file, dataUrl) {
        if (!this.uploadedLogo) return;

        this.uploadedLogoPreview.src = dataUrl;
        this.uploadedLogoName.textContent = file.name;
        this.uploadedLogoSize.textContent = this.formatFileSize(file.size);
        
        this.logoUploadArea.style.display = 'none';
        this.uploadedLogo.style.display = 'flex';
    }

    removeCustomLogo() {
        this.customLogo = null;
        
        if (this.uploadedLogo) {
            this.uploadedLogo.style.display = 'none';
        }
        
        if (this.logoUploadArea) {
            this.logoUploadArea.style.display = 'block';
        }
        
        if (this.logoFileInput) {
            this.logoFileInput.value = '';
        }
        
        this.generateBadge();
        this.showToast('Custom logo removed');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Global function for template toggle
function toggleTemplates() {
    const content = document.getElementById('template-content');
    const toggle = document.getElementById('template-toggle');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        toggle.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
}

// Initialize the badge generator and add utility functions
document.addEventListener('DOMContentLoaded', () => {
    new ShieldyBadgeGenerator();
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to generate badge
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('generate-badge').click();
        }
        
        // Ctrl+M to copy markdown
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            document.getElementById('copy-markdown').click();
        }
        
        // Ctrl+H to copy HTML
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            document.getElementById('copy-html').click();
        }
        
        // Ctrl+L to copy URL
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            document.getElementById('copy-url').click();
        }

        // Ctrl+1 for static badges
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
            e.preventDefault();
            document.querySelector('[data-type="static"]').click();
        }

        // Ctrl+2 for dynamic badges
        if ((e.ctrlKey || e.metaKey) && e.key === '2') {
            e.preventDefault();
            document.querySelector('[data-type="dynamic"]').click();
        }
    });

    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 500);
            }
        });
    });

    // Add auto-save functionality to localStorage
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Load saved values
        const savedValue = localStorage.getItem(`shieldy_${input.id}`);
        if (savedValue && input.type !== 'checkbox') {
            input.value = savedValue;
        } else if (savedValue && input.type === 'checkbox') {
            input.checked = savedValue === 'true';
        }

        // Save values on change
        input.addEventListener('change', () => {
            if (input.type === 'checkbox') {
                localStorage.setItem(`shieldy_${input.id}`, input.checked);
            } else {
                localStorage.setItem(`shieldy_${input.id}`, input.value);
            }
        });
    });
});
