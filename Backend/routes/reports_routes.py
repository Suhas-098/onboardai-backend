from flask import Blueprint, jsonify, send_file
from services.alert_service import AlertService
from utils.auth_guard import check_role
import io
import csv
import datetime
import traceback

# Report Dependencies
HAS_REPORTLAB = False
HAS_MATPLOTLIB = False

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    HAS_REPORTLAB = True
except ImportError:
    print("ReportLab missing.")

try:
    import matplotlib
    matplotlib.use('Agg') # Force non-interactive backend
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    print("Matplotlib missing.")

reports_routes = Blueprint("reports_routes", __name__)

# ------------------------------------------------------------------
#  API ENDPOINTS (JSON)
# ------------------------------------------------------------------

@reports_routes.route("/reports/summary", methods=["GET"])
@check_role(["admin", "hr"])
def get_reports_summary():
    """
    Returns aggregated stats for the reports dashboard.
    Constructs a specific response format required by Reports.js frontend.
    """
    # 1. Get Base Stats
    stats = AlertService.get_dashboard_stats()
    
    # 2. Get User Risks for granular data (Top Risks, Averages)
    users = AlertService.get_user_risks()
    
    # Calculate Average Completion
    total_completion = sum(u['completion'] for u in users)
    avg_completion = round(total_completion / len(users), 1) if users else 0
    
    # Identify Top Risks
    # Priority: Critical > Delayed > At Risk > On Track
    risk_order = {"Critical": 0, "Delayed": 1, "At Risk": 2, "On Track": 3}
    sorted_users = sorted(users, key=lambda x: risk_order.get(x['risk'], 4))
    
    # Filter only risky users for the "Top Risks" list (optional, but good for focus)
    # The frontend just maps them, so we'll send the top 5 worst status
    top_risks = sorted_users[:5] 

    # Calculate Department Breakdown
    depts = {}
    for u in users:
        d = u['department'] or "Unassigned"
        depts[d] = depts.get(d, 0) + 1
    
    department_breakdown = [{"department": d, "count": c} for d, c in depts.items()]
    
    # Construct Response matching Reports.js expectations
    response = {
        "total_employees": stats.get("total_users", 0),
        "averages": {
            "completion": avg_completion
        },
        "risk_summary": {
            "on_track": stats.get("on_track", 0),
            "at_risk": stats.get("at_risk", 0),
            "delayed": stats.get("delayed", 0) 
        },
        "top_risks": top_risks,
        "department_breakdown": department_breakdown
    }
    
    return jsonify(response)

@reports_routes.route("/reports/weekly-risk-trend", methods=["GET"])
@check_role(["admin", "hr"])
def get_weekly_risk_trend():
    """
    Returns trend data for the chart.
    """
    trend = AlertService.get_risk_trend()
    return jsonify(trend)

# ------------------------------------------------------------------
#  DOWNLOAD ENDPOINTS (PDF, CSV, EXCEL)
# ------------------------------------------------------------------

@reports_routes.route("/reports/download/pdf", methods=["GET"])
@check_role(["admin", "hr"])
def download_pdf():
    if not HAS_REPORTLAB:
        return jsonify({"error": "Server missing ReportLab library. Please install reportlab."}), 500

    try:
        # 1. Fetch Data via Service
        stats = AlertService.get_dashboard_stats()
        users = AlertService.get_user_risks()
        
        # Calculate avg completion from user list
        total_completion = sum(u['completion'] for u in users)
        avg_completion = round(total_completion / len(users), 1) if users else 0

        # Department Stats
        depts = {}
        for u in users:
            d = u['department'] or "Unassigned"
            depts[d] = depts.get(d, 0) + 1

        # 2. PDF Setup
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title Styling
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=10,
            textColor=colors.HexColor("#0F172A")
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#64748B")
        )

        # Header Section
        elements.append(Paragraph("OnboardAI Enterprise Report", title_style))
        elements.append(Paragraph(f"Generated on: {datetime.datetime.now().strftime('%B %d, %Y')}", subtitle_style))
        elements.append(Spacer(1, 20))

        # KPI Cards (As a Table)
        # stats is dict: total_users, on_track, at_risk, delayed
        kpi_data = [
            ["Total Employees", "Avg Completion", "On Track", "At Risk", "Critical"],
            [
                str(stats.get("total_users", 0)), 
                f"{avg_completion}%", 
                str(stats.get("on_track", 0)), 
                str(stats.get("at_risk", 0)), 
                str(stats.get("delayed", 0))
            ]
        ]
        
        kpi_table = Table(kpi_data, colWidths=[1.5*inch]*5)
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#64748B")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 14),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor("#0F172A")),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 15),
            
            # Risk Colors
            ('TEXTCOLOR', (2, 1), (2, 1), colors.HexColor("#10B981")), # Green
            ('TEXTCOLOR', (3, 1), (3, 1), colors.HexColor("#F59E0B")), # Yellow
            ('TEXTCOLOR', (4, 1), (4, 1), colors.HexColor("#EF4444")), # Red
            
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0"))
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 25))

        # Charts Section
        if HAS_MATPLOTLIB:
            def create_chart_img(fig):
                img_buf = io.BytesIO()
                fig.savefig(img_buf, format='png', dpi=100, bbox_inches='tight')
                img_buf.seek(0)
                return RLImage(img_buf, width=3*inch, height=2.5*inch)

            try:
                # Risk Dist Chart
                plt.figure(figsize=(4, 3))
                colors_list = ['#10B981', '#F59E0B', '#EF4444']
                # Data from stats service
                PieData = [
                    max(1, stats.get("on_track", 0)), 
                    max(0, stats.get("at_risk", 0)), 
                    max(0, stats.get("delayed", 0))
                ]
                plt.pie(PieData, labels=['On Track', 'At Risk', 'Critical'], colors=colors_list, autopct='%1.1f%%')
                plt.title('Risk Distribution')
                risk_img = create_chart_img(plt.gcf())
                plt.close()

                # Dept Chart
                plt.figure(figsize=(4, 3))
                if depts:
                    plt.bar(list(depts.keys()), list(depts.values()), color='#3B82F6')
                else:
                    plt.text(0.5, 0.5, 'No Data', ha='center')
                plt.title('Department Distribution')
                plt.xticks(rotation=45, ha='right')
                dept_img = create_chart_img(plt.gcf())
                plt.close()
                
                # Chart Table
                chart_table = Table([[risk_img, dept_img]], colWidths=[3.5*inch, 3.5*inch])
                chart_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                elements.append(chart_table)
            except Exception as e:
                print(f"Chart generation failed: {e}")
                elements.append(Paragraph("Charts could not be generated.", styles['Normal']))
        else:
            elements.append(Paragraph("Charts unavailable (Matplotlib missing).", styles['Normal']))
            
        elements.append(Spacer(1, 20))

        # Top Risks Table
        elements.append(Paragraph("Top Attention Needed", styles['Heading2']))
        elements.append(Spacer(1, 10))
        
        # Sort by risk severity
        risk_order = {"Critical": 0, "Delayed": 1, "At Risk": 2, "On Track": 3}
        # users is a list of dicts now
        sorted_users = sorted(users, key=lambda x: risk_order.get(x['risk'], 4))
        top_risks = sorted_users[:5]
        
        table_data = [["Name", "Department", "Risk Status", "Avg Completion"]]
        for u in top_risks:
            table_data.append([
                u['name'],
                u['department'] or "N/A",
                u['risk'],
                f"{int(u['completion'])}%"
            ])
            
        risk_table = Table(table_data, colWidths=[2*inch, 2*inch, 1.5*inch, 1.5*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#64748B")),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ]))
        
        # Row styling for risks
        for i, row in enumerate(table_data[1:], start=1):
            r_status = row[2]
            color = colors.HexColor("#0F172A")
            if r_status in ["Critical", "Delayed"]: color = colors.HexColor("#EF4444")
            elif r_status == "At Risk": color = colors.HexColor("#F59E0B")
            elif r_status == "On Track": color = colors.HexColor("#10B981")
            
            risk_table.setStyle(TableStyle([('TEXTCOLOR', (2, i), (2, i), color)]))

        elements.append(risk_table)
        
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(buffer, as_attachment=True, download_name="OnboardAI_Report.pdf", mimetype='application/pdf')
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500

@reports_routes.route("/reports/download/csv", methods=["GET"])
@check_role(["admin", "hr"])
def download_csv():
    try:
        users = AlertService.get_user_risks()
        
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Name", "Email", "Department", "Role", "Risk Status", "Avg Completion"])

        for u in users:
            writer.writerow([
                u['name'], 
                "N/A", 
                u['department'], 
                "Employee", 
                u['risk'], 
                f"{u['completion']}%"
            ])

        output.seek(0)
        
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype="text/csv",
            as_attachment=True,
            download_name="employees_report.csv"
        )
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@reports_routes.route("/reports/download/excel", methods=["GET"])
@check_role(["admin", "hr"])
def download_excel():
    try:
        import pandas as pd
        
        users = AlertService.get_user_risks()
        data = []
        for u in users:
            data.append({
                "Name": u['name'],
                "Department": u['department'],
                "Risk Status": u['risk'],
                "Completion": f"{u['completion']}%"
            })
            
        df = pd.DataFrame(data)
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Employees')
            
        output.seek(0)
        
        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="employees_report.xlsx"
        )
    except ImportError:
        return jsonify({"error": "Pandas/Openpyxl not installed"}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
