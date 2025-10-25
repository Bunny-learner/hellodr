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
    FiList
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
    const navigate=useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:8000/doctor/dashboarddetails', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });



                if(response.status==401)   
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
                        '#36A2EB', // Accepted (Blue)
                        '#FFCE56', // Pending (Yellow)
                        '#4BC0C0', // Completed (Green)
                        '#FF6384', // Rejected (Red)
                    ],
                    hoverBackgroundColor: [
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#FF6384',
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
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
                    backgroundColor: '#4BC0C0',
                },
                {
                    label: 'This Month',
                    data: [dashboardData.monthlyEarnings],
                    backgroundColor: '#36A2EB',
                },
            ],
        };
    }, [dashboardData]);
    
    const barOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Earnings Overview' },
        },
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Appointment Status' },
        },
    };

    const renderDashboard = () => {
        if (isLoading) {
            return <div className="dashboard-loader"><HeartLoader /></div>;
        }

        if (error) {
            return <div className="dashboard-error">
                <h3>Oops! Something went wrong.</h3>
                <p>{error}</p>
            </div>;
        }

        if (!dashboardData) {
            return <div className="dashboard-error"><h3>No data available.</h3></div>;
        }

        return (
            <div className="dashboard-container">
                <h1 className="dashboard-welcome">Welcome back, Doctor!</h1>
                <p className="dashboard-subtitle">Here's a summary of your activity.</p>
                
              
                <div className="stat-card-grid">
                    <StatCard
                        icon={<FiClock />}
                        title="Today's Appointments"
                        value={dashboardData.todayAcceptedAppointments}
                        color="blue"
                    />
                    <StatCard
                        icon={<FiBell />}
                        title="Pending Today"
                        value={dashboardData.todayPendingAppointments}
                        color="yellow"
                    />
                    <StatCard
                        icon={<FiDollarSign />}
                        title="Monthly Earnings"
                        value={formatCurrency(dashboardData.monthlyEarnings)}
                        color="green"
                    />
                    <StatCard
                        icon={<FiUsers />}
                        title="Total Patients"
                        value={dashboardData.totalPatientCount}
                        color="purple"
                    />
                </div>

                {/* --- Charts --- */}
                <div className="charts-container">
                    <div className="chart-wrapper">
                        <h3>Appointment Status</h3>
                        <Pie data={appointmentPieData} options={pieOptions} />
                    </div>
                    <div className="chart-wrapper">
                        <h3>Earnings Overview</h3>
                        <Bar options={barOptions} data={earningsBarData} />
                    </div>
                </div>

                {/* --- Actionable Lists --- */}
                <div className="lists-container">
                    <div className="list-wrapper">
                        <div className="list-header">
                            <FiList />
                            <h3>Upcoming Appointments</h3>
                        </div>
                        <div className="action-list">
                            {dashboardData.upcomingAppointmentsList.length > 0 ? (
                                dashboardData.upcomingAppointmentsList.map(app => (
                                    <div key={app._id} className="list-item">
                                        <div className="list-item-main">
                                            <span className="list-item-name">{app.patient?.name || 'Patient'}</span>
                                            <span className="list-item-time">
                                                <FiCalendar /> {formatDate(app.date)} at {formatTime(app.date)}
                                            </span>
                                        </div>
                                        <FiCheckCircle className="list-item-icon green" />
                                    </div>
                                ))
                            ) : (
                                <p className="list-empty">No upcoming appointments.</p>
                            )}
                        </div>
                    </div>

                    <div className="list-wrapper">
                        <div className="list-header">
                            <FiBell />
                            <h3>Recent Pending Requests</h3>
                        </div>
                        <div className="action-list">
                            {dashboardData.pendingAppointmentsList.length > 0 ? (
                                dashboardData.pendingAppointmentsList.map(app => (
                                    <div key={app._id} className="list-item">
                                        <div className="list-item-main">
                                            <span className="list-item-name">{app.patient?.name || 'Patient'}</span>
                                            <span className="list-item-time">
                                                <FiCalendar /> {formatDate(app.date)} at {formatTime(app.date)}
                                            </span>
                                        </div>
                                        <FiClock className="list-item-icon yellow" />
                                    </div>
                                ))
                            ) : (
                                <p className="list-empty">No pending requests.</p>
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


function StatCard({ icon, title, value, color }) {
    return (
        <div className={`stat-card color-${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
                <p>{title}</p>
                <h3>{value}</h3>
            </div>
        </div>
    );
}
