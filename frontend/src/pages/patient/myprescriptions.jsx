import { useState, useEffect } from 'react';
import { Search, Download, Share2, Calendar, Clock, FileText, Filter, Pill, User } from 'lucide-react';
import '../../css/prescriptions.css';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/patient/getprescriptions`);
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      const data = await response.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (pdfUrl, fileName) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'prescription.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download prescription');
    }
  };

  const handleShare = async (prescription) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prescription from Dr. ${prescription.doctorName}`,
          text: `Prescription dated ${new Date(prescription.date).toLocaleDateString()}`,
          url: prescription.pdfUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(prescription.pdfUrl);
      alert('Prescription link copied to clipboard!');
    }
  };

  const filteredPrescriptions = prescriptions
    .filter(p => 
      p.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

  if (loading) {
    return (
      <div className="prescriptions-loading">
        <div className="loader-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="loading-text">Loading prescriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prescriptions-error">
        <div className="error-content">
          <div className="error-icon-wrapper">
            <svg viewBox="0 0 24 24" className="error-icon">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchPrescriptions} className="retry-btn">
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <div className="header-icon-wrapper">
              <FileText size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="page-title">My Prescriptions</h1>
              <p className="page-subtitle">
                {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'} available
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="controls-bar">
          <div className="search-box">
            <Search size={20} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <Filter size={18} strokeWidth={2} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="doctor">By Doctor</option>
            </select>
          </div>
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <Pill size={64} strokeWidth={1.5} />
            </div>
            <h3>No Prescriptions Found</h3>
            <p>You don't have any prescriptions yet or no results match your search.</p>
          </div>
        ) : (
          <div className="prescriptions-list">
            {filteredPrescriptions.map((prescription, index) => (
              <div key={prescription.id} className="prescription-item" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="prescription-left">
                  <div className="prescription-icon">
                    <User size={24} strokeWidth={2} />
                  </div>
                  
                  <div className="prescription-info">
                    <div className="prescription-header-info">
                      <h3 className="doctor-name">Dr. {prescription.doctorName}</h3>
                      <span className="prescription-badge">Prescription</span>
                    </div>
                    
                    <div className="prescription-meta">
                      <div className="meta-group">
                        <Calendar size={16} strokeWidth={2} />
                        <span>
                          {new Date(prescription.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="meta-divider"></div>
                      <div className="meta-group">
                        <Clock size={16} strokeWidth={2} />
                        <span>
                          {new Date(prescription.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {prescription.notes && (
                      <div className="prescription-notes">
                        <p>{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="prescription-actions">
                  <button
                    onClick={() => handleDownload(prescription.pdfUrl, `prescription-${prescription.id}.pdf`)}
                    className="action-button primary-action"
                    title="Download Prescription"
                  >
                    <Download size={20} strokeWidth={2} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleShare(prescription)}
                    className="action-button secondary-action"
                    title="Share Prescription"
                  >
                    <Share2 size={20} strokeWidth={2} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPrescriptions;