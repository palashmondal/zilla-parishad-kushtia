const ProjectMap = {
    map: null,
    markerCluster: null,
    allProjects: [],
    searchQuery: '',

    async init() {
        try {
            // Initialize Leaflet map with default center (will fit bounds after loading data)
            this.map = L.map('mapContainer').setView([23.9, 89.1], 10);

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Initialize marker cluster group with per-upazila unclustering
            this.markerCluster = L.markerClusterGroup({
                maxClusterRadius: 45, // Smaller radius for tighter clusters when zoomed out
                disableClusteringAtZoom: 10, // Unclusters at zoom 10+ to show all individual pins in default view
                chunkedLoading: true, // Load markers in chunks for better performance
                zoomToBoundsOnClick: true, // Zoom to cluster bounds on click
                animate: true, // Smooth animation when clustering
                iconCreateFunction: (cluster) => {
                    const childCount = cluster.getChildCount();
                    // Color circles based on cluster size for visual hierarchy
                    let color, size, fontSize;
                    if (childCount > 30) {
                        color = '#ef4444'; // Red for large clusters
                        size = 60;
                        fontSize = 20;
                    } else if (childCount > 15) {
                        color = '#f97316'; // Orange for medium-large clusters
                        size = 55;
                        fontSize = 18;
                    } else if (childCount > 8) {
                        color = '#eab308'; // Yellow for medium clusters
                        size = 50;
                        fontSize = 16;
                    } else {
                        color = '#84cc16'; // Light green for small clusters
                        size = 45;
                        fontSize = 15;
                    }

                    const html = `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: ${fontSize}px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 2px solid white;">${childCount}</div>`;
                    return L.divIcon({
                        html: html,
                        className: 'custom-cluster-icon',
                        iconSize: L.point(size, size)
                    });
                }
            });
            this.map.addLayer(this.markerCluster);

            // Load filter options
            await this.loadFilterOptions();

            // Load initial map data
            await this.loadMapData();

            // Attach filter change listeners for auto-update
            document.getElementById('yearFilter').addEventListener('change', () => this.applyFilters());
            document.getElementById('upazilaFilter').addEventListener('change', () => this.applyFilters());
            document.getElementById('methodFilter').addEventListener('change', () => this.applyFilters());
            document.getElementById('priorityFilter').addEventListener('change', () => this.applyFilters());

            // Attach search input listener
            document.getElementById('searchInput').addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.applyFilters();
            });

            console.log('ProjectMap initialized successfully');
        } catch (error) {
            console.error('Error initializing ProjectMap:', error);
        }
    },

    async loadFilterOptions() {
        try {
            // Fetch and populate years
            const yearsRes = await fetch('/api/projects/years');
            const years = await yearsRes.json();
            const yearSelect = document.getElementById('yearFilter');
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            // Fetch and populate upazilas
            const upazilaRes = await fetch('/api/projects/upazilas');
            const upazilas = await upazilaRes.json();
            const upazilaSelect = document.getElementById('upazilaFilter');
            upazilas.forEach(upazila => {
                const option = document.createElement('option');
                option.value = upazila;
                option.textContent = upazila;
                upazilaSelect.appendChild(option);
            });

            // Populate implementation methods
            const methods = ['টেন্ডার', 'সিপিপিসি', 'আরএফকিউ'];
            const methodSelect = document.getElementById('methodFilter');
            methods.forEach(method => {
                const option = document.createElement('option');
                option.value = method;
                option.textContent = method;
                methodSelect.appendChild(option);
            });

            // Populate priorities
            const priorities = [
                { value: 'general', label: 'সাধারণ' },
                { value: 'medium', label: 'মধ্যম' },
                { value: 'top_priority', label: 'সর্বোচ্চ অগ্রাধিকার' }
            ];
            const prioritySelect = document.getElementById('priorityFilter');
            priorities.forEach(priority => {
                const option = document.createElement('option');
                option.value = priority.value;
                option.textContent = priority.label;
                prioritySelect.appendChild(option);
            });

            console.log('Filter options loaded');
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    },

    async loadMapData() {
        try {
            const year = document.getElementById('yearFilter').value;
            const upazila = document.getElementById('upazilaFilter').value;
            const method = document.getElementById('methodFilter').value;
            const priority = document.getElementById('priorityFilter').value;

            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (upazila) params.append('upazila', upazila);
            if (method) params.append('implementation_method', method);
            if (priority) params.append('priority', priority);

            const res = await fetch(`/api/projects/map-data?${params}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            let projects = await res.json();

            // Apply search filter if search query exists
            if (this.searchQuery) {
                projects = projects.filter(project => {
                    const searchableText = `${project.name} ${project.upazila} ${project.id}`.toLowerCase();
                    return searchableText.includes(this.searchQuery);
                });
            }

            this.allProjects = projects;

            this.renderMarkers();
            document.getElementById('totalProjects').textContent = this.allProjects.length;

            console.log(`Loaded ${this.allProjects.length} projects (after search/filters)`);
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    },

    getProgressColor(progress) {
        // Map progress percentage to color (red → yellow → green)
        progress = Math.max(0, Math.min(100, progress || 0));

        if (progress === 0) return '#ef4444'; // Red
        if (progress < 25) {
            // Red to Orange (0-25%)
            const ratio = progress / 25;
            return this.interpolateColor('#ef4444', '#f97316', ratio);
        } else if (progress < 50) {
            // Orange to Yellow (25-50%)
            const ratio = (progress - 25) / 25;
            return this.interpolateColor('#f97316', '#eab308', ratio);
        } else if (progress < 75) {
            // Yellow to Light Green (50-75%)
            const ratio = (progress - 50) / 25;
            return this.interpolateColor('#eab308', '#84cc16', ratio);
        } else if (progress < 100) {
            // Light Green to Green (75-100%)
            const ratio = (progress - 75) / 25;
            return this.interpolateColor('#84cc16', '#22c55e', ratio);
        }
        return '#22c55e'; // Full Green
    },

    interpolateColor(color1, color2, factor) {
        // Convert hex to RGB
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);

        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;

        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;

        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    },

    createProgressMarker(color) {
        // Create SVG marker with custom color
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="25" height="41">
                <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <!-- Marker pin shape -->
                <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 28 12 28s12-20 12-28c0-6.6-5.4-12-12-12z"
                      fill="${color}" filter="url(#shadow)" />
                <!-- White dot in center -->
                <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
            </svg>
        `;

        const markerIcon = L.icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            shadowSize: [41, 41]
        });

        return markerIcon;
    },

    getMarkerColor(implementationMethod) {
        const colors = {
            'টেন্ডার': 'blue',
            'সিপিপিসি': 'green',
            'আরএফকিউ': 'orange'
        };
        return colors[implementationMethod] || 'gray';
    },

    getPriorityLabel(priority) {
        const labels = {
            'general': 'সাধারণ',
            'medium': 'মধ্যম',
            'top_priority': 'সর্বোচ্চ অগ্রাধিকার'
        };
        return labels[priority] || priority;
    },

    getProgressColor(progress) {
        if (progress >= 75) return '#10b981'; // green
        if (progress >= 50) return '#f59e0b'; // amber
        if (progress >= 25) return '#f97316'; // orange
        return '#ef4444'; // red
    },

    createPopupContent(project) {
        const progressColor = this.getProgressColor(project.progress);
        const priorityLabel = this.getPriorityLabel(project.priority);
        const progressPercentage = project.progress || 0;
        const budget = project.allocation_amount ? `৳${new Intl.NumberFormat('bn-BD').format(project.allocation_amount)}` : 'N/A';
        const year = project.financial_year || 'N/A';
        const fundType = project.fund_type || 'N/A';

        return `
            <div style="font-family: Shurjo, 'Siyam Rupali', Roboto; font-size: 13px; width: 100%;">
                <div style="padding: 12px;">
                    <!-- Project Name with ID -->
                    <div style="margin-bottom: 10px;">
                        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; line-height: 1.3;">
                            ${project.name}
                        </h3>
                        <p style="margin: 2px 0 0 0; font-size: 11px; color: #9ca3af;">Project ID: ${project.id}</p>
                    </div>

                    <!-- Two Column Layout -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                        <!-- Left Column -->
                        <div>
                            <div style="margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                                <span style="color: #6b7280; font-size: 12px;">📍 উপজেলা:</span>
                                <span style="color: #1f2937; font-weight: 500; font-size: 12px; margin-left: 4px;">${project.upazila}</span>
                            </div>
                            <div style="margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                                <span style="color: #6b7280; font-size: 12px;">🔧 পদ্ধতি:</span>
                                <span style="color: #1f2937; font-weight: 500; font-size: 12px; margin-left: 4px;">${project.implementation_method}</span>
                            </div>
                            <div style="margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                                <span style="color: #6b7280; font-size: 12px;">⭐ অগ্রাধিকার:</span>
                                <span style="color: #1f2937; font-weight: 500; font-size: 12px; margin-left: 4px;">${priorityLabel}</span>
                            </div>
                            <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                <span style="color: #6b7280; font-size: 12px;">📊 অবস্থা:</span>
                                <span style="color: #1f2937; font-weight: 500; font-size: 12px; margin-left: 4px;">${project.status}</span>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div>
                            <div style="margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                                <span style="color: #6b7280; font-size: 12px;">💰 বাজেট:</span>
                                <span style="color: #1f2937; font-weight: 600; font-size: 12px; margin-left: 4px;">${budget}</span>
                            </div>
                            <div style="margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                                <span style="color: #6b7280; font-size: 12px;">📅 অর্থবছর:</span>
                                <span style="color: #1f2937; font-weight: 500; font-size: 12px; margin-left: 4px;">${year}</span>
                            </div>
                            <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                <span style="color: #6b7280; font-size: 12px;">🏦 তহবিল:</span>
                                <span style="color: #1f2937; font-weight: 500; font-size: 12px; margin-left: 4px;">${fundType}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div style="margin-bottom: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: #6b7280; font-size: 12px;">📈 অগ্রগতি:</span>
                            <span style="color: ${progressColor}; font-weight: 600; font-size: 12px;">${progressPercentage}%</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">
                            <div style="width: ${progressPercentage}%; height: 100%; background: ${progressColor}; transition: width 0.3s ease;"></div>
                        </div>
                    </div>

                    <!-- Details Link -->
                    <a href="/admin/projects-manage.html?id=${project.id}"
                       style="display: block; text-align: center; background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 600; transition: background 0.2s ease; cursor: pointer;"
                       onmouseover="this.style.background='#059669'"
                       onmouseout="this.style.background='#10b981'">
                        বিস্তারিত দেখুন →
                    </a>
                </div>
            </div>
        `;
    },

    renderMarkers() {
        // Clear existing markers
        this.markerCluster.clearLayers();

        if (this.allProjects.length === 0) {
            console.log('No projects to render');
            return;
        }

        let markersAdded = 0;
        const bounds = L.latLngBounds();

        this.allProjects.forEach(project => {
            // Skip projects without valid coordinates
            if (!project.lat || !project.lng || isNaN(project.lat) || isNaN(project.lng)) {
                console.warn(`Project ${project.id} has invalid coordinates: lat=${project.lat}, lng=${project.lng}`);
                return;
            }

            // Validate coordinates are within reasonable bounds (Kushtia region)
            if (project.lat < 23.5 || project.lat > 24.5 || project.lng < 88.5 || project.lng > 89.5) {
                console.warn(`Project ${project.id} coordinates out of region: lat=${project.lat}, lng=${project.lng}`);
            }

            // Use progress-based color gradient instead of implementation method
            const progressColor = this.getProgressColor(project.progress);
            const markerIcon = this.createProgressMarker(progressColor);


            const marker = L.marker([project.lat, project.lng], { icon: markerIcon });

            // Hover tooltip with project name
            marker.bindTooltip(project.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -10],
                className: 'project-tooltip'
            });

            // Click popup with project details
            const popupContent = this.createPopupContent(project);
            marker.bindPopup(popupContent, {
                maxWidth: 420,
                minWidth: 420,
                className: 'project-popup'
            });

            // Open popup on click
            marker.on('click', () => {
                marker.openPopup();
            });

            this.markerCluster.addLayer(marker);
            bounds.extend([project.lat, project.lng]);
            markersAdded++;
        });

        console.log(`Rendered ${markersAdded} markers out of ${this.allProjects.length} projects`);

        // Fit map bounds to show all upazilas with unclustered pins
        if (markersAdded > 0 && bounds.isValid()) {
            try {
                // Fit bounds to show all projects unclustered within each upazila
                this.map.fitBounds(bounds, {
                    padding: [60, 60],
                    maxZoom: 10, // Keeps zoom at level where pins are unclustered (disableClusteringAtZoom: 10)
                    animate: true,
                    duration: 0.8
                });
            } catch (error) {
                console.error('Error fitting bounds:', error);
                // Fallback: show Kushtia region with all projects visible
                this.map.setView([23.9, 89.1], 10);
            }
        } else if (markersAdded === 0) {
            // No valid markers, show default view
            this.map.setView([23.9, 89.1], 9);
        }
    },

    async applyFilters() {
        await this.loadMapData();
    }
};

// Initialize on page load
window.addEventListener('load', () => {
    AuthManager.requireModule('projects').then(() => {
        DashboardComponents.loadAll('projects-map', 'প্রকল্প ম্যাপ').then(() => {
            ProjectMap.init();
        });
    }).catch(error => {
        console.error('Authorization error:', error);
        window.location.href = '/admin/';
    });
});
