import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import HeartLoader from '../../components/Loaders/heartloader';
import NavBar from '../../components/Navbar/navbar';
import {
    FiDollarSign,
    FiUsers,
    FiClock,
    FiBell,
    FiCalendar,
    FiCheckCircle,
    FiList,
    FiTrendingUp,
    FiActivity
} from 'react-icons/fi';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import "../../css/doctorhome.css"; 
import { Navigate, useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL;

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

// Helper function to format time
const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// Helper function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

// Helper to format currency (assuming INR)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function DoctorHome() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API}/doctor/dashboarddetails`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if(response.status == 401)   
                    navigate('/doctor/login?alert=Session expired please login again')

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Failed to fetch dashboard data");
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError(err.message);
                toast.error(err.message || "Could not load dashboard.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Memoize chart data to prevent re-renders
    const appointmentPieData = useMemo(() => {
        if (!dashboardData) return null;
        return {
            labels: ['Accepted', 'Pending', 'Completed', 'Rejected'],
            datasets: [
                {
                    label: 'Appointments',
                    data: [
                        dashboardData.acceptedAppointments,
                        dashboardData.pendingAppointments,
                        dashboardData.completedAppointments,
                        dashboardData.rejectedAppointments,
                    ],
                    backgroundColor: [
                        '#3b82f6',
                        '#f59e0b',
                        '#10b981',
                        '#ef4444',
                    ],
                    hoverBackgroundColor: [
                        '#2563eb',
                        '#d97706',
                        '#059669',
                        '#dc2626',
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                },
            ],
        };
    }, [dashboardData]);

    const earningsBarData = useMemo(() => {
        if (!dashboardData) return null;
        return {
            labels: ['Earnings'],
            datasets: [
                {
                    label: 'Total Earnings',
                    data: [dashboardData.totalEarnings],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 8,
                },
                {
                    label: 'This Month',
                    data: [dashboardData.monthlyEarnings],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 8,
                },
            ],
        };
    }, [dashboardData]);
    
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top',
                labels: {
                    font: { size: 13, weight: '600' },
                    padding: 15,
                    usePointStyle: true,
                }
            },
            title: { 
                display: false
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                grid: {
                    display: false,
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'bottom',
                labels: {
                    font: { size: 12, weight: '600' },
                    padding: 15,
                    usePointStyle: true,
                }
            },
            title: { 
                display: false
            },
        },
    };

    const renderDashboard = () => {
        if (isLoading) {
            return (
                <div className="dashboard-loader">
                    <HeartLoader />
                    <p>Loading your dashboard...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="dashboard-error">
                    <div className="error-icon">⚠️</div>
                    <h3>Oops! Something went wrong.</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            );
        }

        if (!dashboardData) {
            return <div className="dashboard-error"><h3>No data available.</h3></div>;
        }

        return (
            <div className="dashboard-container">
                {/* Header Section */}
                <div className="dashboard-header">
                    <div className="header-content">
                        <div className="welcome-badge">
                            <FiActivity className="badge-icon" />
                            <span>Dashboard Overview</span>
                        </div>
                        <h1 className="dashboard-welcome">Welcome back, Doctor!</h1>
                        <p className="dashboard-subtitle">Here's what's happening with your practice today.</p>
                    </div>
                    <div className="header-decoration">
                        <div className="decoration-circle circle-1"></div>
                        <div className="decoration-circle circle-2"></div>
                        <div className="decoration-circle circle-3"></div>
                    </div>
                </div>
                
                {/* Stat Cards Grid */}
                <div className="stat-card-grid">
                    <StatCard
                        icon={<FiClock />}
                        title="Today's Appointments"
                        value={dashboardData.todayAcceptedAppointments}
                        color="blue"
                        trend="+12%"
                    />
                    <StatCard
                        icon={<FiBell />}
                        title="Pending Today"
                        value={dashboardData.todayPendingAppointments}
                        color="yellow"
                        trend="3 new"
                    />
                    <StatCard
                        icon={<FiDollarSign />}
                        title="Monthly Earnings"
                        value={formatCurrency(dashboardData.monthlyEarnings)}
                        color="green"
                        trend="+8.2%"
                    />
                    <StatCard
                        icon={<FiUsers />}
                        title="Total Patients"
                        value={dashboardData.totalPatientCount}
                        color="purple"
                        trend="+23"
                    />
                </div>

                {/* Charts Section */}
                <div className="charts-container">
                    <div className="chart-card">
                        <div className="chart-header">
                            <div>
                                <h3>Appointment Status</h3>
                                <p className="chart-subtitle">Distribution of all appointments</p>
                            </div>
                        </div>
                        <div className="chart-body">
                            <Pie data={appointmentPieData} options={pieOptions} />
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-header">
                            <div>
                                <h3>Earnings Overview</h3>
                                <p className="chart-subtitle">Compare total vs monthly earnings</p>
                            </div>
                        </div>
                        <div className="chart-body bar-chart">
                            <Bar options={barOptions} data={earningsBarData} />
                        </div>
                    </div>
                </div>

                {/* Lists Section */}
                <div className="lists-container">
                    {/* Upcoming Appointments */}
                    <div className="list-card">
                        <div className="list-header">
                            <div className="list-header-left">
                                <div className="list-icon-wrapper upcoming">
                                    <FiCalendar />
                                </div>
                                <div>
                                    <h3>Upcoming Appointments</h3>
                                    <p className="list-count">{dashboardData.upcomingAppointmentsList.length} scheduled</p>
                                </div>
                            </div>
                        </div>
                        <div className="action-list">
                            {dashboardData.upcomingAppointmentsList.length > 0 ? (
                                dashboardData.upcomingAppointmentsList.map(app => (
                                    <div key={app._id} className="list-item">
                                        <div className="list-item-avatar">
                                            {(app.patient?.name || 'P').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="list-item-content">
                                            <span className="list-item-name">{app.patient?.name || 'Patient'}</span>
                                            <span className="list-item-time">
                                                <FiCalendar className="time-icon" /> 
                                                {formatDate(app.date)} • {formatTime(app.date)}
                                            </span>
                                        </div>
                                        <div className="list-item-badge success">
                                            <FiCheckCircle />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="list-empty">
                                    <FiCalendar className="empty-icon" />
                                    <p>No upcoming appointments</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="list-card">
                        <div className="list-header">
                            <div className="list-header-left">
                                <div className="list-icon-wrapper pending">
                                    <FiBell />
                                </div>
                                <div>
                                    <h3>Pending Requests</h3>
                                    <p className="list-count">{dashboardData.pendingAppointmentsList.length} awaiting response</p>
                                </div>
                            </div>
                        </div>
                        <div className="action-list">
                            {dashboardData.pendingAppointmentsList.length > 0 ? (
                                dashboardData.pendingAppointmentsList.map(app => (
                                    <div key={app._id} className="list-item">
                                        <div className="list-item-avatar">
                                            {(app.patient?.name || 'P').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="list-item-content">
                                            <span className="list-item-name">{app.patient?.name || 'Patient'}</span>
                                            <span className="list-item-time">
                                                <FiCalendar className="time-icon" /> 
                                                {formatDate(app.date)} • {formatTime(app.date)}
                                            </span>
                                        </div>
                                        <div className="list-item-badge warning">
                                            <FiClock />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="list-empty">
                                    <FiBell className="empty-icon" />
                                    <p>No pending requests</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <section className="dashboard-page">
                {renderDashboard()}
            </section>
        </>
    );
}

function StatCard({ icon, title, value, color, trend }) {
    return (
        <div className={`stat-card color-${color}`}>
            <div className="stat-card-header">
                <div className="stat-icon-wrapper">
                    <div className="stat-icon">{icon}</div>
                </div>
                {trend && (
                    <div className="stat-trend">
                        <FiTrendingUp className="trend-icon" />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <div className="stat-info">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
            </div>
        </div>
    );
}