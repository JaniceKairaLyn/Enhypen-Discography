const albumGrid = document.getElementById('album-grid');
const modal = document.getElementById('tracklist-modal');
const modalTitle = document.getElementById('modal-title');
const modalTracks = document.getElementById('modal-tracks');
const closeModal = document.getElementById('close-modal');

let allAlbums = [];

// 1. Fetch the data (Using .then to avoid await errors)
fetch('discography.json')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log("Successfully loaded albums:", data.length);
        allAlbums = data;
        renderAlbums(allAlbums); // Render all albums on load
    })
    .catch(error => {
        console.error('Error loading discography:', error);
        albumGrid.innerHTML = `<p style="color: #ff5e5e; text-align: center; width: 100%;">Failed to load albums.</p>`;
    });

// 2. Render album cards
function renderAlbums(albums) {
    albumGrid.innerHTML = '';
    
    if (!albums || albums.length === 0) {
        albumGrid.innerHTML = '<p style="text-align: center; width: 100%;">No albums found.</p>';
        return;
    }

    albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
            <img src="${album.cover}" alt="${album.title} cover" onerror="this.src='https://via.placeholder.com/300/333/fff?text=No+Cover'">
            <div class="album-info">
                <h3>${album.title}</h3>
                <p>${album.releaseDate.split('-')[0]} • ${album.type}</p>
            </div>
        `;
        card.addEventListener('click', () => openTracklist(album));
        albumGrid.appendChild(card);
    });
}

// 3. Open the modal with tracklist and YouTube links
function openTracklist(album) {
    modalTitle.textContent = album.title;
    modalTracks.innerHTML = '';
    
    // Determine which tracks to show
    let tracksToShow = album.tracks;
    
    // If the user has typed something in the search bar, filter the tracks!
    if (searchQuery.trim() !== '') {
        tracksToShow = album.tracks.filter(track => 
            track.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    // Loop through the filtered tracks and create the list
    tracksToShow.forEach((track, index) => {
        const li = document.createElement('li');
        
        // Note: If filtered, the numbers might not match the actual album order
        // So we just show the track name. If no filter, we show the number.
        const trackDisplay = searchQuery.trim() !== '' ? track : `${index + 1}. ${track}`;
        
        const searchUrl = encodeURIComponent(`ENHYPEN ${track}`);
        const youtubeUrl = `https://www.youtube.com/results?search_query=${searchUrl}`;
        
        li.innerHTML = `
            <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
                ${trackDisplay}
            </a>
        `;
        
        modalTracks.appendChild(li);
    });
    
    modal.classList.remove('hidden');
}

// 4. Close the modal
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// 5. Combined Filtering Logic (Buttons + Search)
const searchInput = document.getElementById('search-input');
let currentFilter = 'All';
let searchQuery = '';

function applyFilters() {
    let filteredAlbums = allAlbums;

    // 1. Apply Category Filter (Buttons)
    if (currentFilter !== 'All') {
        filteredAlbums = filteredAlbums.filter(album => album.type.includes(currentFilter));
    }

    // 2. Apply Search Filter (Album Title OR Song Titles)
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase(); // Convert search to lowercase for case-insensitive matching
        
        filteredAlbums = filteredAlbums.filter(album => {
            // Check if the album title matches
            const titleMatch = album.title.toLowerCase().includes(query);
            
            // Check if ANY song in the tracklist matches
            const songMatch = album.tracks.some(track => 
                track.toLowerCase().includes(query)
            );

            // Return true if either the album title OR a song name matches
            return titleMatch || songMatch;
        });
    }

    // Render the final result
    renderAlbums(filteredAlbums);
}

// Listen for clicks on the Filter Buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        currentFilter = e.target.getAttribute('data-filter');
        applyFilters();
    });
});

// Listen for typing in the Search Bar
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    applyFilters();
});