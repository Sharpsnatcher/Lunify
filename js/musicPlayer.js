// Music Player & Yandex Music Integration

class MusicPlayer {
    constructor() {
        this.initialized = false;
        this.currentTrack = null;
        this.isPlaying = false;
        this.yandexMusicConnected = false;

        // Mood playlists mapping
        this.moodPlaylists = {
            happy: {
                name: 'Поднять настроение',
                tracks: [
                    { title: 'Happy', artist: 'Pharrell Williams', duration: 233 },
                    { title: 'Walking on Sunshine', artist: 'Katrina and the Waves', duration: 239 },
                    { title: 'Good Vibrations', artist: 'The Beach Boys', duration: 218 }
                ],
                spotifyUri: 'spotify:playlist:37i9dQZF1DXdPec7aLTmlC'
            },
            calm: {
                name: 'Успокоиться',
                tracks: [
                    { title: 'Weightless', artist: 'Marconi Union', duration: 485 },
                    { title: 'Clair de Lune', artist: 'Claude Debussy', duration: 287 },
                    { title: 'River Flows In You', artist: 'Yiruma', duration: 198 }
                ],
                spotifyUri: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO'
            },
            focus: {
                name: 'Сосредоточиться',
                tracks: [
                    { title: 'Lo-Fi Study', artist: 'ChilledCow', duration: 195 },
                    { title: 'Deep Focus', artist: 'Study Music', duration: 212 },
                    { title: 'Concentration', artist: 'Focus Music', duration: 188 }
                ],
                spotifyUri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ'
            },
            sleep: {
                name: 'Заснуть',
                tracks: [
                    { title: 'Sleep Meditation', artist: 'Deep Sleep', duration: 357 },
                    { title: 'Night Sounds', artist: 'Relaxation', duration: 422 },
                    { title: 'Peaceful Dreams', artist: 'Sleep Music', duration: 389 }
                ],
                spotifyUri: 'spotify:playlist:37i9dQZF1DWZd79rJ6a7lp'
            },
            energize: {
                name: 'Зарядиться энергией',
                tracks: [
                    { title: 'Eye of the Tiger', artist: 'Survivor', duration: 246 },
                    { title: 'Thunder', artist: 'Imagine Dragons', duration: 187 },
                    { title: 'Stronger', artist: 'Kanye West', duration: 311 }
                ],
                spotifyUri: 'spotify:playlist:37i9dQZF1DX76Wlfdnj7AP'
            },
            sad: {
                name: 'Выплеснуть эмоции',
                tracks: [
                    { title: 'Someone Like You', artist: 'Adele', duration: 285 },
                    { title: 'Fix You', artist: 'Coldplay', duration: 294 },
                    { title: 'The Scientist', artist: 'Coldplay', duration: 309 }
                ],
                spotifyUri: 'spotify:playlist:37i9dQZF1DX3YSRoSdA634'
            }
        };
    }

    init() {
        if (this.initialized) return;

        console.log('🎵 Music Player initialized');
        this.attachEventListeners();
        this.checkSpotifyConnection();
        this.initialized = true;
    }

    attachEventListeners() {
        // Mood category cards
        const moodCards = document.querySelectorAll('.mood-category-card');
        moodCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const mood = card.dataset.mood;
                this.playMoodPlaylist(mood);
            });
        });

        // Player controls
        const playPauseBtn = document.getElementById('playPauseBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousTrack());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextTrack());
        }

        // Spotify connect button
        const yandexMusicBtn = document.getElementById('spotifyConnectBtn');
        if (yandexMusicBtn) {
            yandexMusicBtn.addEventListener('click', () => this.connectYandexMusic());
        }

        // Playlist cards
        const playlistCards = document.querySelectorAll('.playlist-card');
        playlistCards.forEach(card => {
            card.addEventListener('click', () => {
                this.showNotification('Запуск плейлиста...', 'info');
            });
        });
    }

    playMoodPlaylist(mood) {
        const playlist = this.moodPlaylists[mood];

        if (!playlist) {
            console.error('Playlist not found for mood:', mood);
            return;
        }

        // Show now playing section
        const nowPlayingSection = document.getElementById('nowPlayingSection');
        if (nowPlayingSection) {
            nowPlayingSection.style.display = 'block';
            nowPlayingSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Play first track from playlist
        if (playlist.tracks && playlist.tracks.length > 0) {
            this.currentTrack = playlist.tracks[0];
            this.updateNowPlaying(this.currentTrack);
            this.startPlayback();
            this.showNotification(`Играет: ${playlist.name}`, 'success');
        }

        // If Spotify is connected, try to play Spotify playlist
        if (this.spotifyConnected && playlist.spotifyUri) {
            this.playSpotifyPlaylist(playlist.spotifyUri);
        }
    }

    updateNowPlaying(track) {
        const titleEl = document.getElementById('nowPlayingTitle');
        const artistEl = document.getElementById('nowPlayingArtist');
        const totalTimeEl = document.getElementById('totalTime');

        if (titleEl) titleEl.textContent = track.title;
        if (artistEl) artistEl.textContent = track.artist;
        if (totalTimeEl) totalTimeEl.textContent = this.formatTime(track.duration);
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const playPauseBtn = document.getElementById('playPauseBtn');

        if (playPauseBtn) {
            playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }

        if (this.isPlaying) {
            this.startPlayback();
        } else {
            this.pausePlayback();
        }
    }

    startPlayback() {
        this.isPlaying = true;
        // Simulate playback progress
        this.startProgressAnimation();
    }

    pausePlayback() {
        this.isPlaying = false;
    }

    previousTrack() {
        this.showNotification('Предыдущий трек', 'info');
        // TODO: Implement track switching logic
    }

    nextTrack() {
        this.showNotification('Следующий трек', 'info');
        // TODO: Implement track switching logic
    }

    startProgressAnimation() {
        const progressFill = document.getElementById('progressFill');
        const currentTimeEl = document.getElementById('currentTime');

        if (!progressFill || !this.currentTrack) return;

        let progress = 0;
        const duration = this.currentTrack.duration;
        const interval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(interval);
                return;
            }

            progress += 1;
            const percentage = (progress / duration) * 100;

            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }

            if (currentTimeEl) {
                currentTimeEl.textContent = this.formatTime(progress);
            }

            if (progress >= duration) {
                clearInterval(interval);
                this.nextTrack();
            }
        }, 1000);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Spotify Integration
    connectYandexMusic() {
        // This is a placeholder for Yandex Music OAuth flow
        // In production, you would:
        // 1. Redirect to Yandex Music authorization
        // 2. Get access token
        // 3. Store token
        // 4. Initialize Yandex Music SDK

        this.showNotification('Подключение к Яндекс.Музыке...', 'info');

        // Simulate connection
        setTimeout(() => {
            this.yandexMusicConnected = true;
            this.showNotification('Яндекс.Музыка подключена успешно!', 'success');

            // Hide connect section
            const connectSection = document.querySelector('.spotify-connect-section');
            if (connectSection) {
                connectSection.style.display = 'none';
            }
        }, 2000);

        // Real implementation would look like:
        /*
        const CLIENT_ID = 'your_spotify_client_id';
        const REDIRECT_URI = window.location.origin + '/callback';
        const SCOPES = 'streaming user-read-email user-read-private';

        window.location = `https://accounts.spotify.com/authorize?` +
            `client_id=${CLIENT_ID}` +
            `&response_type=token` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&scope=${encodeURIComponent(SCOPES)}`;
        */
    }

    checkSpotifyConnection() {
        // Check if there's a Spotify token in localStorage
        const token = localStorage.getItem('spotify_access_token');
        if (token) {
            this.spotifyConnected = true;
            const connectSection = document.querySelector('.spotify-connect-section');
            if (connectSection) {
                connectSection.style.display = 'none';
            }
        }
    }

    playSpotifyPlaylist(uri) {
        if (!this.spotifyConnected) {
            console.log('Spotify not connected');
            return;
        }

        // Use Spotify Web Playback SDK to play
        console.log('Playing Spotify URI:', uri);

        // Real implementation would use Spotify SDK:
        /*
        fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                context_uri: uri
            })
        });
        */
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 6000;
            font-size: 14px;
            font-weight: 600;
            animation: slideInRight 0.4s ease, fadeOut 0.4s ease 2.6s;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize music player
window.musicPlayer = new MusicPlayer();

// Auto-initialize when music tab is shown
document.addEventListener('DOMContentLoaded', () => {
    const musicTab = document.getElementById('music-tab');
    if (musicTab) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    window.musicPlayer.init();
                }
            });
        });

        observer.observe(musicTab, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Initialize if already active
        if (musicTab.classList.contains('active')) {
            window.musicPlayer.init();
        }
    }
});

console.log('✅ Music Player Module loaded');
