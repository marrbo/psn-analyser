'use client'

import { useState } from 'react'
import Modal from '../components/Modal'

interface Profile {
  onlineId: string
  accountId: string
  avatarUrl: string
  isPlus: boolean
  isOfficiallyVerified: boolean
  primaryOnlineStatus: string
  trophySummary?: {
    level: number
    total: number
  }
}

interface Game {
  name: string
  imageUrl: string
  platform: string
  progress: number
  earnedTrophies: {
    platinum: number
    gold: number
    silver: number
    bronze: number
  }
}

export default function Home() {
  const [psnId, setPsnId] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState<'error' | 'warning' | 'success' | 'info'>('error')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [games, setGames] = useState<Game[]>([])

  const showModal = (title: string, message: string, type: 'error' | 'warning' | 'success' | 'info' = 'error') => {
    setModalTitle(title)
    setModalMessage(message)
    setModalType(type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!psnId.trim()) {
      showModal('Campo Vazio', 'Por favor, digite um Online ID da PSN.', 'warning')
      return
    }

    setLoading(true)
    setProfile(null)
    setGames([])

    try {
      const response = await fetch(`/api/profile/${psnId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar perfil')
      }

      if (data.success) {
        setProfile(data.data.profile)
        setGames(data.data.games || [])
        showModal('Perfil Encontrado!', `Perfil de ${data.data.profile.onlineId} carregado com sucesso!`, 'success')
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err: any) {
      showModal('Erro na Busca', err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (username: string) => {
    setPsnId(username)
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <i className="fab fa-playstation"></i>
            <h1>PSN <span>Analyser</span></h1>
          </div>
          <p className="tagline">Descubra suas estatísticas épicas da PlayStation Network</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          {/* Search Section */}
          <section className="search-section">
            <div className="search-card">
              <div className="search-header">
                <i className="fas fa-search"></i>
                <h2>Buscar Perfil PSN</h2>
                <p>Digite seu Online ID da PlayStation Network</p>
              </div>
              
              <form className="search-form" onSubmit={handleSearch}>
                <div className="input-group">
                  <i className="fas fa-user"></i>
                  <input 
                    type="text" 
                    value={psnId}
                    onChange={(e) => setPsnId(e.target.value)}
                    placeholder="Ex: JogadorEpico123" 
                    required
                    disabled={loading}
                  />
                  <div className="input-highlight"></div>
                </div>
                <button 
                  type="submit" 
                  className={`search-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  <span className="btn-text">Analisar Perfil</span>
                  <span className="btn-loader">
                    <i className="fas fa-spinner fa-spin"></i>
                  </span>
                  <div className="btn-glow"></div>
                </button>
              </form>
            </div>
          </section>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner">
                <div className="spinner-circle"></div>
                <div className="spinner-glow"></div>
              </div>
              <p>Analisando perfil PSN...</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {/* Results Section */}
          {profile && !loading && (
            <section className="results-section">
              {/* Profile Card */}
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <img 
                      src={profile.avatarUrl || 'https://via.placeholder.com/100/00a8ff/ffffff?text=PSN'} 
                      alt={profile.onlineId}
                    />
                    <div className={`online-status ${profile.primaryOnlineStatus === 'online' ? 'online' : 'offline'}`}></div>
                  </div>
                  <div className="profile-info">
                    <h2>{profile.onlineId}</h2>
                    <p>ID: {profile.accountId}</p>
                    <div className="profile-badges">
                      {profile.isPlus && (
                        <span className="badge plus">PSN Plus</span>
                      )}
                      {profile.isOfficiallyVerified && (
                        <span className="badge verified">Verificado</span>
                      )}
                    </div>
                  </div>
                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {profile.trophySummary?.level || '0'}
                      </span>
                      <span className="stat-label">Nível</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {profile.trophySummary?.total || '0'}
                      </span>
                      <span className="stat-label">Troféus</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Games Grid */}
              <div className="games-section">
                <h3 className="section-title">
                  <i className="fas fa-gamepad"></i>
                  Biblioteca de Jogos
                </h3>
                <div className="games-grid">
                  {games.length > 0 ? (
                    games.slice(0, 12).map((game, index) => (
                      <div key={index} className="game-card">
                        <div className="game-header">
                          <img 
                            src={game.imageUrl || 'https://via.placeholder.com/60/00a8ff/ffffff?text=Game'} 
                            alt={game.name}
                            className="game-icon"
                          />
                          <div>
                            <h3 className="game-title">
                              {game.name.length > 20 
                                ? `${game.name.substring(0, 20)}...` 
                                : game.name
                              }
                            </h3>
                            <p className="game-platform">{game.platform || 'PS4/PS5'}</p>
                          </div>
                        </div>
                        
                        <div className="game-stats">
                          <div className="game-stat">
                            <span className="game-stat-value">{game.progress || 0}%</span>
                            <span className="game-stat-label">Progresso</span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${game.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="game-stat">
                            <span className="game-stat-value">
                              {(game.earnedTrophies?.platinum || 0) + (game.earnedTrophies?.gold || 0)}
                            </span>
                            <span className="game-stat-label">Troféus Raros</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-games">
                      <p>Nenhum jogo encontrado na biblioteca</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 PSN Analyser. Não afiliado à Sony Interactive Entertainment.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacidade</a>
            <a href="#" className="footer-link">Termos</a>
            <a href="#" className="footer-link">Contato</a>
          </div>
        </div>
      </footer>

      {/* Modal Component */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
      />
    </div>
  )
}