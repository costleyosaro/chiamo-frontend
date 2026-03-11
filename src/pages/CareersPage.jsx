// src/pages/CareersPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiChevronLeft, FiMapPin, FiBriefcase, FiClock, 
  FiChevronRight, FiHeart, FiUsers, FiTrendingUp,
  FiCoffee, FiAward, FiGlobe
} from "react-icons/fi";
import "./CareersPage.css";

const JOB_OPENINGS = [
  {
    id: 1,
    title: "Area Sales Manager",
    department: "Beverages",
    location: "Port Harcourt, Nigeria",
    type: "Full-time",
    description: "We're looking for an experienced Area Sales Manager to help build and improve sales in a location."
  },
  {
    id: 2,
    title: "Sales Rep",
    department: "FOOD",
    location: "On-site",
    type: "Full-time",
    description: "Join our sales team to drive Sales and Grow product awareness in the market."
  },
  {
    id: 3,
    title: "Customer Success Manager",
    department: "Operations",
    location: "Portharcourt, Nigeria",
    type: "Full-time",
    description: "Help our customers succeed and grow their businesses with ChiamoOrder."
  },
  {
    id: 4,
    title: "Delivery Operations Lead",
    department: "Logistics",
    location: "Port Harcourt, Nigeria",
    type: "Full-time",
    description: "Oversee and optimize our delivery operations to ensure customer satisfaction."
  }
];

const BENEFITS = [
  { icon: FiHeart, title: "Health Insurance", description: "Comprehensive health coverage for you and your family" },
  { icon: FiCoffee, title: "Flexible Hours", description: "Work when you're most productive" },
  { icon: FiTrendingUp, title: "Growth", description: "Learning budget and career development opportunities" },
  { icon: FiUsers, title: "Great Team", description: "Work with talented and passionate people" },
  { icon: FiAward, title: "Recognition", description: "Your contributions are valued and rewarded" },
  { icon: FiGlobe, title: "Remote Options", description: "Work from anywhere in Nigeria" }
];

export default function CareersPage() {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="careers-page">
      <header className="careers-header">
        <button className="careers-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h1>Careers</h1>
      </header>

      <div className="careers-hero">
        <h2>Join Our Team</h2>
        <p>
          Be part of a mission to revolutionize how businesses order and receive supplies. 
          We're building something amazing, and we want you to be part of it.
        </p>
      </div>

      <section className="careers-benefits">
        <h3>Why Work With Us?</h3>
        <div className="benefits-grid">
          {BENEFITS.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">
                <benefit.icon />
              </div>
              <h4>{benefit.title}</h4>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="careers-openings">
        <h3>Open Positions</h3>
        <div className="jobs-list">
          {JOB_OPENINGS.map((job) => (
            <div 
              key={job.id} 
              className={`job-card ${selectedJob === job.id ? 'expanded' : ''}`}
              onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
            >
              <div className="job-header">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <div className="job-meta">
                    <span><FiBriefcase /> {job.department}</span>
                    <span><FiMapPin /> {job.location}</span>
                    <span><FiClock /> {job.type}</span>
                  </div>
                </div>
                <FiChevronRight className={`job-arrow ${selectedJob === job.id ? 'rotated' : ''}`} />
              </div>
              {selectedJob === job.id && (
                <div className="job-details">
                  <p>{job.description}</p>
                  <button 
                    className="apply-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:careers@chiamoorder.com?subject=Application for ${job.title}`;
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="careers-cta">
        <h3>Don't See the Right Role?</h3>
        <p>
          We're always looking for talented people. Send us your resume and 
          we'll keep you in mind for future opportunities.
        </p>
        <a href="mailto:careers@chiamoorder@gmail.com" className="careers-email-btn">
          Send Your Resume
        </a>
      </section>
    </div>
  );
}