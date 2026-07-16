from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT

INK = HexColor("#14171A")
BLUE = HexColor("#3556FF")
MUTED = HexColor("#54514A")

styles = getSampleStyleSheet()

name_style = ParagraphStyle('Name', parent=styles['Normal'], fontName='Helvetica-Bold',
                             fontSize=26, textColor=INK, spaceAfter=2)
role_style = ParagraphStyle('Role', parent=styles['Normal'], fontName='Helvetica-Bold',
                             fontSize=12, textColor=BLUE, spaceAfter=10)
contact_style = ParagraphStyle('Contact', parent=styles['Normal'], fontName='Helvetica',
                                fontSize=9.5, textColor=MUTED, spaceAfter=14)
section_style = ParagraphStyle('Section', parent=styles['Normal'], fontName='Helvetica-Bold',
                                fontSize=12.5, textColor=INK, spaceBefore=14, spaceAfter=6)
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica',
                             fontSize=10, textColor=INK, leading=14, alignment=TA_LEFT)
proj_title_style = ParagraphStyle('ProjTitle', parent=styles['Normal'], fontName='Helvetica-Bold',
                                   fontSize=10.5, textColor=INK, spaceBefore=6)
proj_meta_style = ParagraphStyle('ProjMeta', parent=styles['Normal'], fontName='Helvetica-Oblique',
                                  fontSize=9, textColor=BLUE, spaceAfter=2)
proj_body_style = ParagraphStyle('ProjBody', parent=styles['Normal'], fontName='Helvetica',
                                  fontSize=9.5, textColor=MUTED, leading=13, spaceAfter=6)

doc = SimpleDocTemplate("resume.pdf", pagesize=letter,
                         topMargin=0.55*inch, bottomMargin=0.55*inch,
                         leftMargin=0.65*inch, rightMargin=0.65*inch)

story = []

story.append(Paragraph("HASSAN AHMED", name_style))
story.append(Paragraph("Full Stack Developer &amp; AI / ML Engineer", role_style))
story.append(Paragraph(
    "Sadiqabad, Pakistan &nbsp;|&nbsp; hani141998@gmail.com &nbsp;|&nbsp; "
    "github.com/Hassan141998 &nbsp;|&nbsp; linkedin.com/in/hassan-ahmed-98304030a",
    contact_style))
story.append(HRFlowable(width="100%", thickness=1.4, color=INK, spaceAfter=8))

story.append(Paragraph("PROFILE", section_style))
story.append(Paragraph(
    "Full Stack Developer and AI/ML Engineer finishing a BSCS at the Islamia University of "
    "Bahawalpur. Focused on turning trained machine learning models into real, deployed "
    "products &mdash; comfortable across the stack from FastAPI/Flask backends to Next.js/React "
    "front-ends, with scikit-learn and XGBoost in between.",
    body_style))

story.append(Paragraph("SKILLS", section_style))
skills_data = [
    ["Languages", "Python, TypeScript, JavaScript, SQL, HTML5, CSS3"],
    ["Frontend", "Next.js, React, Tailwind CSS, Recharts, Framer Motion"],
    ["Backend &amp; ML/AI", "FastAPI, Flask, scikit-learn, XGBoost, Pandas, NumPy"],
    ["Database &amp; Cloud", "PostgreSQL, Neon, SQLite, AWS IoT, Vercel, MQTT"],
]
skills_table = Table(
    [[Paragraph(f"<b>{k}</b>", body_style), Paragraph(v, body_style)] for k, v in skills_data],
    colWidths=[1.5*inch, 5.1*inch]
)
skills_table.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('TOPPADDING', (0,0), (-1,-1), 0),
]))
story.append(skills_table)

story.append(Paragraph("FEATURED PROJECTS", section_style))

projects = [
    ("InsureCalc — Medical Insurance Cost Predictor", "Next.js · FastAPI · Python · R² 99.3%",
     "Medical insurance cost predictor built on 4 ML models, with animated regional cost maps "
     "and a savings estimator for lifestyle changes."),
    ("CardioScan — Heart Attack Risk Prediction", "Next.js · XGBoost · AUC ~94%",
     "Heart attack risk prediction using an XGBoost + Random Forest + KNN ensemble, with a live "
     "ECG-style hero and a what-if risk simulator."),
    ("GlucoseGuard — Diabetes Risk Classification", "Next.js · scikit-learn · AUC ~83%",
     "Diabetes risk classification via a 3-model ensemble (RF, LR, SVM) with SHAP-style "
     "explainability and downloadable PDF reports."),
    ("SEMS — Smart Energy Management System", "Flask · AWS IoT · ARIMA · MAPE 7.4%",
     "Final-year project: ESP32 + MQTT (TLS 1.3) real-time monitoring, ARIMA 7-day forecasting, "
     "anomaly detection, and LoRaWAN for off-grid deployment."),
    ("Face Recognition Attendance System", "Flask · PostgreSQL · Face-API.js",
     "Real-time face detection and recognition attendance system with student profiles, "
     "analytics, and CSV export."),
    ("Chinook Analytics — SQL BI Dashboard", "SQL · Python",
     "End-to-end business-intelligence dashboard over the Chinook music-store dataset: revenue, "
     "markets, RFM segments, and forecasting."),
]

for title, meta, desc in projects:
    story.append(Paragraph(title, proj_title_style))
    story.append(Paragraph(meta, proj_meta_style))
    story.append(Paragraph(desc, proj_body_style))

story.append(Paragraph("EDUCATION", section_style))
edu_table = Table(
    [[Paragraph("<b>BSCS — Bachelor of Science in Computer Science</b><br/>Islamia University of Bahawalpur", body_style),
      Paragraph("2023 &ndash; 2025", body_style)]],
    colWidths=[5.1*inch, 1.5*inch]
)
edu_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
story.append(edu_table)

doc.build(story)
print("resume.pdf created")
