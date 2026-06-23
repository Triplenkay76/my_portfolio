import { useState, useEffect, useRef } from "react";
import { PROJECTS, TESTIMONIALS, SKILLS, CATEGORIES } from "./data";

function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

function AnimatedBar({ level, delay, inView }) {
  return (
    <div style={{
      width: "100%", height: 6, borderRadius: 3,
      background: "rgba(255,255,255,0.08)", overflow: "hidden",
    }}>
      <div style={{
        width: inView ? `${level}%` : "0%",
        height: "100%", borderRadius: 3,
        background: "linear-gradient(90deg, #C8A961, #E8D5A3)",
        transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }} />
    </div>
  );
}

function GridPattern() {
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.03, pointerEvents: "none" }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export default function Portfolio() {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openProject, setOpenProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [skillsRef, skillsInView] = useInView();
  const [projRef, projInView] = useInView();
  const [testRef, testInView] = useInView();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (openProject) {
      document.body.style.overflow = "hidden";
      const onKey = (e) => { if (e.key === "Escape") setOpenProject(null); };
      window.addEventListener("keydown", onKey);
      return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
    } else {
      document.body.style.overflow = "";
    }
  }, [openProject]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "testimonials", label: "Testimonials" },
    { id: "contact", label: "Contact" },
  ];

  const filteredProjects = activeFilter === "All"
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeFilter);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#0B0F1A",
      color: "#E8E6E1",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: #C8A961; color: #0B0F1A; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
        .nav-link {
          color: #8A8A8A;
          text-decoration: none;
          font-size: 13px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.3s;
          background: none;
          border: none;
          font-family: inherit;
        }
        .nav-link:hover { color: #C8A961; }
        .nav-link:focus-visible { outline: 2px solid #C8A961; outline-offset: 4px; border-radius: 2px; }
        .project-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .project-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(200,169,97,0.3);
          transform: translateY(-4px);
        }
        .cta-btn:focus-visible, .modal-close:focus-visible {
          outline: 2px solid #C8A961;
          outline-offset: 3px;
        }
        .shimmer-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
          pointer-events: none;
          border-radius: 10px;
        }
        .tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.1);
          color: #9A9A9A;
          margin: 3px;
        }
        .filter-btn {
          padding: 6px 18px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #777;
          font-family: inherit;
        }
        .filter-btn:hover {
          border-color: rgba(200,169,97,0.3);
          color: #C8A961;
        }
        .filter-btn.active {
          background: #C8A961;
          color: #0B0F1A;
          border-color: #C8A961;
          font-weight: 600;
        }
        .testimonial-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 36px;
          transition: all 0.4s;
        }
        .testimonial-card:hover {
          border-color: rgba(200,169,97,0.2);
        }
        .cta-btn {
          display: inline-block;
          padding: 16px 40px;
          border: 1px solid #C8A961;
          color: #C8A961;
          text-decoration: none;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.4s;
          background: transparent;
          font-family: inherit;
          border-radius: 4px;
        }
        .cta-btn:hover { background: #C8A961; color: #0B0F1A; }
        .cta-btn-filled { background: #C8A961; color: #0B0F1A; border-color: #C8A961; }
        .cta-btn-filled:hover { background: #E8D5A3; border-color: #E8D5A3; }
        .section-label {
          font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
          color: #C8A961; margin-bottom: 16px; font-weight: 500;
        }
        .section-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 4vw, 42px); font-weight: 600;
          line-height: 1.2; margin-bottom: 24px; color: #F5F3EF;
        }
        .body-text { color: #9A9A9A; font-size: 15px; line-height: 1.8; font-weight: 300; }
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .hamburger span { width: 24px; height: 1.5px; background: #E8E6E1; transition: all 0.3s; }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .desktop-nav { display: none !important; }
          .mobile-menu {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(11,15,26,0.97); display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 32px; z-index: 100;
            backdrop-filter: blur(20px);
          }
          .mobile-menu .nav-link { font-size: 18px; }
          .hero-inner { grid-template-columns: 1fr !important; }
          .hero-image-wrap { display: none !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .modal-content { width: 95vw !important; height: 75vh !important; }
          .modal-header { padding: 16px 20px !important; }
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 200;
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.3s ease-out; cursor: pointer;
        }
        .modal-content {
          width: 90vw; height: 85vh; max-width: 1400px; background: #111520;
          border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
          animation: modalSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1); cursor: default;
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
        }
        .modal-close {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
          color: #888; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.3s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.1); color: #E8E6E1; border-color: rgba(255,255,255,0.2); }
        .modal-iframe-wrap { flex: 1; position: relative; background: #0B0F1A; }
        .modal-iframe-wrap iframe { width: 100%; height: 100%; border: none; }
        .modal-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; gap: 20px; color: #555;
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "0 clamp(24px, 5vw, 80px)", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrollY > 50 ? "rgba(11,15,26,0.92)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.04)" : "none",
        transition: "all 0.4s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("hero")}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "linear-gradient(135deg, #C8A961, #8B7335)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#0B0F1A",
          }}>NBP</div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>NICHOLAS BEDIAKO POKU</span>
        </div>
        <div className="desktop-nav" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {navItems.map(item => (
            <a key={item.id} href={`#${item.id}`} className="nav-link" aria-label={`Navigate to ${item.label}`}
              onClick={(e) => { e.preventDefault(); scrollTo(item.id); }}>
              {item.label}
            </a>
          ))}
        </div>
        <button className="hamburger" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="nav-link" onClick={() => setMenuOpen(false)} aria-label="Close menu"
            style={{ position: "absolute", top: 24, right: 24, fontSize: 24, color: "#E8E6E1" }}>✕</button>
          {navItems.map(item => (
            <a key={item.id} href={`#${item.id}`} className="nav-link" aria-label={`Navigate to ${item.label}`}
              onClick={(e) => { e.preventDefault(); scrollTo(item.id); }}>
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* DASHBOARD MODAL */}
      {openProject && (
        <div className="modal-overlay" onClick={() => setOpenProject(null)}
          role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 20, color: openProject.color, lineHeight: 1 }}>{openProject.icon}</span>
                <div>
                  <h3 id="modal-title" style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 18, fontWeight: 600, color: "#F5F3EF", marginBottom: 2,
                  }}>{openProject.title}</h3>
                  <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#666" }}>
                    {openProject.subtitle}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
                  {openProject.tags.map(tag => (
                    <span key={tag} className="tag" style={{ margin: 0, fontSize: 9, padding: "3px 8px" }}>{tag}</span>
                  ))}
                </div>
                <button className="modal-close" onClick={() => setOpenProject(null)} aria-label="Close modal">✕</button>
              </div>
            </div>
            <div className="modal-iframe-wrap">
              {openProject.embedUrl ? (
                <iframe title={openProject.title} src={openProject.embedUrl} allowFullScreen
                  loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups" />
              ) : (
                <div className="modal-placeholder">
                  <div style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>Dashboard embed not configured yet</div>
                  <div style={{ fontSize: 12, color: "#444", maxWidth: 340, lineHeight: 1.6, textAlign: "center" }}>
                    Use Power BI "Publish to Web" to generate an embed URL,<br />
                    then set the <code style={{ color: "#C8A961", fontSize: 11 }}>embedUrl</code> field in data.js.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section id="hero" style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "0 clamp(24px, 5vw, 80px)", position: "relative",
      }}>
        <GridPattern />
        <div className="hero-inner" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 60, alignItems: "center", width: "100%",
          maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1,
        }}>
          <div>
            <div style={{
              animation: "fadeIn 1s ease-out", fontSize: 12, letterSpacing: 5,
              textTransform: "uppercase", color: "#C8A961", marginBottom: 24, fontWeight: 500,
            }}>BI & Data Analytics Professional</div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 700, lineHeight: 1.05,
              marginBottom: 24, animation: "fadeUp 1s ease-out 0.2s both",
            }}>
              Nicholas{" "}<br />
              <span style={{
                fontStyle: "italic", fontWeight: 400,
                background: "linear-gradient(135deg, #C8A961, #E8D5A3)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Bediako Poku</span>
            </h1>
            <p style={{
              color: "#7A7A7A", fontSize: 17, lineHeight: 1.8, maxWidth: 520,
              marginBottom: 40, fontWeight: 300, animation: "fadeUp 1s ease-out 0.4s both",
            }}>
              I help universities and organizations transform complex data into actionable
              insight. Using Power BI, SQL Server, Python, and the Microsoft Power
              Platform, I build analytics, reporting, and automation solutions that improve
              visibility, strengthen governance, and support better decision-making across
              accreditation, strategic planning, grants management, and institutional
              performance monitoring.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", animation: "fadeUp 1s ease-out 0.6s both" }}>
              <button className="cta-btn cta-btn-filled" onClick={() => scrollTo("projects")}>View Projects</button>
              <button className="cta-btn" onClick={() => scrollTo("contact")}>Get in Touch</button>
            </div>
          </div>
          <div className="hero-image-wrap" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 1.2s ease-out 0.4s both",
          }}>
            <div style={{
              width: "100%", maxWidth: 400, aspectRatio: "3 / 4", borderRadius: 20,
              overflow: "hidden", border: "2px solid rgba(200, 169, 97, 0.2)",
              background: "linear-gradient(135deg, rgba(200,169,97,0.08), rgba(200,169,97,0.02))",
              position: "relative",
            }}>
              <img src="/profile.JPG" alt="Nicholas Bediako Poku" style={{
                width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top",
              }} onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
              <div style={{
                display: "none", flexDirection: "column", alignItems: "center", justifyContent: "center",
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0, gap: 16,
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 40,
                  background: "linear-gradient(135deg, #C8A961, #8B7335)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 700, color: "#0B0F1A",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}>NBP</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          animation: "fadeIn 1s ease-out 1.2s both",
        }}>
          <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#555" }}>Scroll</span>
          <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, #555, transparent)" }} />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: "120px clamp(24px, 5vw, 80px)", position: "relative" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-label">About</div>
          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div style={{ minWidth: 0 }}>
              <h2 className="section-heading">
                Data tells a story.<br />
                <span style={{ color: "#C8A961" }}>I make it understandable.</span>
              </h2>
              <p className="body-text" style={{ marginBottom: 20 }}>
                I am a Business Intelligence and Institutional Analytics professional focused
                on building data solutions that transform complex operations into actionable insight.
              </p>
              <p className="body-text" style={{ marginBottom: 20 }}>
                My experience spans higher education analytics, strategic planning,
                accreditation management, grants administration, and institutional
                reporting. Using Power BI, Power Apps, Power Automate, SQL Server,
                SharePoint, and Python, I develop systems that improve data quality,
                automate reporting processes, and provide decision-makers with a reliable
                view of performance and progress.
              </p>
              <p className="body-text" style={{ marginBottom: 20 }}>
                From accreditation-tracking platforms managing more than 100 academic
                programmes to grants-management systems, executive dashboards, and
                large-scale student analytics solutions, I build tools that help
                organizations monitor what matters, identify trends, and make
                evidence-based decisions.
              </p>
              <p className="body-text">
                I am currently pursuing an MSc in Business and Data Analytics, further
                strengthening my expertise in analytics, data strategy, and decision support.
              </p>
            </div>
            <div ref={skillsRef}>
              <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#666", marginBottom: 28, fontWeight: 500 }}>
                Core Competencies
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {SKILLS.map((skill, i) => (
                  <div key={skill.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 400 }}>{skill.name}</span>
                      <span style={{ fontSize: 12, color: "#C8A961", fontWeight: 500 }}>
                        {skillsInView ? `${skill.level}%` : ""}
                      </span>
                    </div>
                    <AnimatedBar level={skill.level} delay={i * 0.12} inView={skillsInView} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" ref={projRef} style={{
        padding: "120px clamp(24px, 5vw, 80px)", position: "relative",
        background: "linear-gradient(180deg, transparent 0%, rgba(200,169,97,0.02) 50%, transparent 100%)",
      }}>
        <GridPattern />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div className="section-label">Projects</div>
          <h2 className="section-heading" style={{ marginBottom: 24 }}>
            Featured <span style={{ color: "#C8A961" }}>Dashboards</span>
          </h2>

          {/* Category Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn${activeFilter === cat ? " active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Project Grid — 2 columns, stacked cards */}
          <div className="projects-grid">
            {filteredProjects.map((proj, idx) => (
              <div
                key={proj.id}
                className="project-card"
                style={{
                  animation: projInView ? `fadeUp 0.6s ease-out ${idx * 0.1}s both` : "none",
                  opacity: projInView ? undefined : 0,
                  borderTop: hoveredProject === proj.id ? `2px solid ${proj.color}` : undefined,
                }}
                onClick={() => setOpenProject(proj)}
                onMouseEnter={() => setHoveredProject(proj.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Text content */}
                <div style={{ padding: "28px 28px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{
                      display: "inline-block", padding: "3px 12px", borderRadius: 20,
                      fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                      background: `${proj.color}15`, color: proj.color, fontWeight: 500,
                    }}>{proj.category}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 20, fontWeight: 600, marginBottom: 10, color: "#F5F3EF",
                    lineHeight: 1.3,
                  }}>{proj.title}</h3>
                  <p style={{
                    color: "#9A9A9A", fontSize: 13, lineHeight: 1.7, fontWeight: 300,
                    marginBottom: 14,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{proj.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {proj.tags.map(tag => (
                      <span key={tag} className="tag" style={{ fontSize: 9, padding: "2px 10px", margin: 0 }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Screenshot preview */}
                <div style={{ marginTop: "auto", position: "relative" }}>
                  <div style={{
                    aspectRatio: "16 / 9", width: "100%", overflow: "hidden",
                    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
                    background: `linear-gradient(135deg, ${proj.color}10, ${proj.color}05)`,
                  }}>
                    {proj.screenshot ? (
                      <img src={proj.screenshot} alt={`${proj.title} dashboard`} style={{
                        width: "100%", height: "100%", objectFit: "cover",
                      }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", display: "flex",
                        alignItems: "center", justifyContent: "center", position: "relative",
                      }}>
                        <div className="shimmer-overlay" />
                        <svg width="120" height="68" viewBox="0 0 120 68" fill="none">
                          <rect x="0" y="0" width="120" height="10" rx="2" fill={`${proj.color}15`} />
                          <rect x="0" y="13" width="24" height="55" rx="2" fill={`${proj.color}08`} />
                          {[0,1,2].map(i => (
                            <rect key={i} x={28 + i * 32} y="15" width="28" height="16" rx="2" fill={`${proj.color}10`} />
                          ))}
                          {[0,1,2,3,4].map(i => (
                            <rect key={i} x={28 + i * 16} y={68 - (10 + Math.sin(i) * 14 + i * 3)}
                              width="12" rx="1.5" height={10 + Math.sin(i) * 14 + i * 3}
                              fill={i === 3 ? proj.color : `${proj.color}20`} />
                          ))}
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Hover expand hint */}
                  <div style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: hoveredProject === proj.id ? "rgba(0,0,0,0.3)" : "transparent",
                    transition: "background 0.3s", borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
                  }}>
                    {hoveredProject === proj.id && (
                      <span style={{
                        fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                        color: "#fff", fontWeight: 500,
                      }}>View Dashboard</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" ref={testRef} style={{ padding: "120px clamp(24px, 5vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-label">Testimonials</div>
          <h2 className="section-heading" style={{ marginBottom: 60 }}>
            What <span style={{ color: "#C8A961" }}>Colleagues</span> Say
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24,
          }}>
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="testimonial-card" style={{
                animation: testInView ? `fadeUp 0.8s ease-out ${idx * 0.15}s both` : "none",
                opacity: testInView ? undefined : 0,
              }}>
                <div style={{ fontSize: 32, color: "#C8A961", marginBottom: 16, lineHeight: 1 }}>"</div>
                <p style={{
                  fontSize: 14, lineHeight: 1.8, color: "#AAAAAA",
                  fontStyle: "italic", marginBottom: 24, fontWeight: 300,
                }}>{t.quote}</p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E6E1" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{t.role}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>{t.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{
        padding: "120px clamp(24px, 5vw, 80px)", position: "relative",
        background: "linear-gradient(180deg, transparent, rgba(200,169,97,0.03))",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label">Contact</div>
          <h2 className="section-heading">
            Let's Build Something<br />
            <span style={{ color: "#C8A961" }}>Together</span>
          </h2>
          <p className="body-text" style={{ marginBottom: 48, maxWidth: 480, margin: "0 auto 48px" }}>
            Whether you need a Power BI dashboard, an institutional analytics system,
            or a Power Platform solution, I'd love to hear about your project.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
            <a href="mailto:nbediakopoku@outlook.com" className="cta-btn cta-btn-filled" style={{ textDecoration: "none" }}>Send an Email</a>
            <a href="https://www.linkedin.com/in/nicholas-bediako-poku-7789b3160/" target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ textDecoration: "none" }}>LinkedIn</a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[
              { label: "Location", value: "Kumasi, Ghana" },
              { label: "Availability", value: "Open to Opportunities" },
              { label: "Specialization", value: "BI & Power Platform" },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: "#AAAAAA" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "40px clamp(24px, 5vw, 80px)", borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ fontSize: 12, color: "#444" }}>
          © {new Date().getFullYear()} Nicholas Bediako Poku. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["LinkedIn", "GitHub", "Email"].map(link => (
            <a key={link} href="#" style={{ fontSize: 12, color: "#555", textDecoration: "none", transition: "color 0.3s" }}
              onMouseEnter={e => e.target.style.color = "#C8A961"}
              onMouseLeave={e => e.target.style.color = "#555"}>
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}