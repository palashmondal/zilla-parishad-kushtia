const ProjectMap = {
    map: null,
    markerCluster: null,
    allProjects: [],

    async init() {
        try {
            // Initialize Leaflet map centered on Kushtia (23.9, 89.1) with zoom level 11
            this.map = L.map('mapContainer').setView([23.9, 89.1], 11);

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Initialize marker cluster group
            this.markerCluster = L.markerClusterGroup();
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
            this.allProjects = await res.json();

            this.renderMarkers();
            document.getElementById('totalProjects').textContent = this.allProjects.length;

            console.log(`Loaded ${this.allProjects.length} projects`);
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    },

    getMarkerColor(implementationMethod) {
        const colors = {
            'টেন্ডার': 'blue',
            'সিপিপিসি': 'green',
            'আরএফকিউ': 'orange'
        };
        return colors[implementationMethod] || 'gray';
    },

    renderMarkers() {
        // Clear existing markers
        this.markerCluster.clearLayers();

        if (this.allProjects.length === 0) {
            console.log('No projects to render');
            return;
        }

        let markersAdded = 0;

        this.allProjects.forEach(project => {
            // Skip projects without valid coordinates
            if (!project.lat || !project.lng || isNaN(project.lat) || isNaN(project.lng)) {
                return;
            }

            const color = this.getMarkerColor(project.implementation_method);
            const markerIcon = L.icon({
                iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker([project.lat, project.lng], { icon: markerIcon });

            // Navigate to project detail page on click
            marker.on('click', () => {
                window.location.href = `/admin/projects-manage.html?id=${project.id}`;
            });

            this.markerCluster.addLayer(marker);
            markersAdded++;
        });

        // Fit map bounds to show all markers
        if (markersAdded > 0) {
            const bounds = this.markerCluster.getBounds();
            if (bounds.isValid()) {
                this.map.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        console.log(`Rendered ${markersAdded} markers`);
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
