#!/usr/bin/env python3
"""Generate Robin — NYU Tandon Submission PDF using reportlab."""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

FONT_DIR = "/Users/lucasting/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/d4ff49dd-7b63-4fbb-b52e-80ccd1456656/1430010a-68d2-4387-bcb6-009e25cdd2bc/skills/canvas-design/canvas-fonts"
OUT_PATH = "/Users/lucasting/Downloads/salesforceapp-main/Robin_NYU_Tandon_Submission.pdf"

# Register fonts
pdfmetrics.registerFont(TTFont("WorkSans", os.path.join(FONT_DIR, "WorkSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("WorkSans-Bold", os.path.join(FONT_DIR, "WorkSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("WorkSans-Italic", os.path.join(FONT_DIR, "WorkSans-Italic.ttf")))
pdfmetrics.registerFont(TTFont("GeistMono", os.path.join(FONT_DIR, "GeistMono-Regular.ttf")))
pdfmetrics.registerFont(TTFont("GeistMono-Bold", os.path.join(FONT_DIR, "GeistMono-Bold.ttf")))
pdfmetrics.registerFont(TTFont("BricolageGrotesque", os.path.join(FONT_DIR, "BricolageGrotesque-Regular.ttf")))
pdfmetrics.registerFont(TTFont("BricolageGrotesque-Bold", os.path.join(FONT_DIR, "BricolageGrotesque-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Jura", os.path.join(FONT_DIR, "Jura-Light.ttf")))
pdfmetrics.registerFont(TTFont("Jura-Medium", os.path.join(FONT_DIR, "Jura-Medium.ttf")))

# Color palette
NAVY     = colors.HexColor("#1a3a6b")
NAVY_MID = colors.HexColor("#2a4f8a")
SLATE    = colors.HexColor("#4a6080")
LIGHT_BG = colors.HexColor("#f5f7fa")
RULE     = colors.HexColor("#d0d8e4")
WHITE    = colors.white
CODE_BG  = colors.HexColor("#0f1b2d")
CODE_FG  = colors.HexColor("#7dd3b0")
GOLD     = colors.HexColor("#b8963e")
MUTED    = colors.HexColor("#7a8fa6")
CRITICAL = colors.HexColor("#c0392b")
HEALTHY  = colors.HexColor("#1a7a4a")
WARN     = colors.HexColor("#b07d1a")

W, H = letter
MARGIN_L = 0.75 * inch
MARGIN_R = 0.75 * inch
MARGIN_T = 0.6 * inch
MARGIN_B = 0.7 * inch

# ── Custom canvas for page-level decorations ────────────────────────────────

class PageCanvas:
    def __init__(self, filename, **kw):
        self.filename = filename

    def __call__(self, c, doc):
        self._draw(c, doc)

    def _draw(self, c, doc):
        page = doc.page
        # Top accent bar
        c.setFillColor(NAVY)
        c.rect(0, H - 0.22 * inch, W, 0.22 * inch, fill=1, stroke=0)

        # Bottom rule + footer
        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(MARGIN_L, MARGIN_B - 0.08 * inch, W - MARGIN_R, MARGIN_B - 0.08 * inch)

        c.setFont("Jura", 7.5)
        c.setFillColor(MUTED)
        c.drawString(MARGIN_L, MARGIN_B - 0.28 * inch, "Robin — Salesforce Fabric  |  NYU Tandon Research Application")
        pg_str = f"{page}"
        c.drawRightString(W - MARGIN_R, MARGIN_B - 0.28 * inch, pg_str)

        # Subtle left margin accent (thin vertical rule)
        c.setStrokeColor(NAVY)
        c.setLineWidth(1.5)
        c.line(0.38 * inch, MARGIN_B, 0.38 * inch, H - 0.35 * inch)


def build_pdf():
    doc = SimpleDocTemplate(
        OUT_PATH,
        pagesize=letter,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T + 0.28 * inch,
        bottomMargin=MARGIN_B + 0.1 * inch,
    )

    story = []
    story += page1()
    story += [PageBreak()]
    story += page2()
    story += [PageBreak()]
    story += page3()
    story += [PageBreak()]
    story += page4()
    story += [PageBreak()]
    story += page5()

    doc.build(story, onFirstPage=PageCanvas(OUT_PATH), onLaterPages=PageCanvas(OUT_PATH))
    print(f"PDF written to {OUT_PATH}")


# ── Shared helpers ───────────────────────────────────────────────────────────

from reportlab.platypus import PageBreak, Flowable

class HRule(Flowable):
    def __init__(self, width, color=RULE, thickness=0.5, spaceAfter=6):
        Flowable.__init__(self)
        self.width = width
        self.color = color
        self.thickness = thickness
        self.spaceAfter = spaceAfter
        self.height = thickness + spaceAfter

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.spaceAfter / 2, self.width, self.spaceAfter / 2)


class ColorBlock(Flowable):
    """A filled rectangle as a decorative block."""
    def __init__(self, width, height, fill_color, stroke_color=None, radius=3):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.fill_color = fill_color
        self.stroke_color = stroke_color
        self.radius = radius

    def draw(self):
        self.canv.setFillColor(self.fill_color)
        if self.stroke_color:
            self.canv.setStrokeColor(self.stroke_color)
            self.canv.roundRect(0, 0, self.width, self.height, self.radius, fill=1, stroke=1)
        else:
            self.canv.roundRect(0, 0, self.width, self.height, self.radius, fill=1, stroke=0)


def ps(name, font="WorkSans", size=9.5, color=colors.HexColor("#1a2535"), leading=None,
       alignment=TA_LEFT, spaceBefore=0, spaceAfter=4, leftIndent=0):
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        textColor=color,
        leading=leading or size * 1.45,
        alignment=alignment,
        spaceBefore=spaceBefore,
        spaceAfter=spaceAfter,
        leftIndent=leftIndent,
    )

BODY     = ps("body", size=9, leading=14.5, spaceAfter=6, color=colors.HexColor("#2c3a4a"))
BODY_SM  = ps("body_sm", size=8.2, leading=13, spaceAfter=4, color=colors.HexColor("#3a4a5a"))
CAPTION  = ps("caption", font="Jura", size=7.5, color=MUTED, spaceAfter=3)
H1       = ps("h1", font="BricolageGrotesque-Bold", size=22, color=NAVY, leading=26, spaceAfter=4)
H2       = ps("h2", font="BricolageGrotesque-Bold", size=14.5, color=NAVY, leading=18, spaceAfter=3)
H3       = ps("h3", font="WorkSans-Bold", size=10, color=NAVY, leading=13, spaceAfter=3)
H4       = ps("h4", font="WorkSans-Bold", size=8.5, color=SLATE, leading=11, spaceAfter=2)
MONO     = ps("mono", font="GeistMono", size=7.8, color=CODE_FG, leading=12, spaceAfter=0)
MONO_KEY = ps("mono_key", font="GeistMono-Bold", size=7.8, color=colors.HexColor("#f0c060"), leading=12)
LABEL    = ps("label", font="Jura-Medium", size=7.5, color=NAVY, leading=10, spaceAfter=2)
TAG      = ps("tag", font="GeistMono", size=7.2, color=SLATE, leading=10)

CONTENT_W = W - MARGIN_L - MARGIN_R


def section_header(title, subtitle=None):
    """Returns a styled section header block."""
    elems = []
    elems.append(Paragraph(title, H2))
    if subtitle:
        elems.append(Paragraph(subtitle, CAPTION))
    elems.append(HRule(CONTENT_W, color=NAVY, thickness=1.2, spaceAfter=10))
    return elems


def chip(text, bg=LIGHT_BG, fg=NAVY, font="GeistMono", size=7.5):
    """Inline code-chip paragraph."""
    style = ps("chip_" + text[:8], font=font, size=size, color=fg, spaceAfter=2)
    return Paragraph(f'<font color="#{bg.hexval()[2:]}">{text}</font>', style)


def code_block(lines, width=None):
    """Dark background code block."""
    w = width or CONTENT_W
    rows = [[Paragraph(line, MONO)] for line in lines]
    t = Table(rows, colWidths=[w - 16])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CODE_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return t


def kv_table(rows, col_widths=None, header=None, stripe=True):
    """Styled key-value or data table."""
    data = []
    if header:
        data.append([Paragraph(h, H4) for h in header])
    for row in rows:
        data.append([Paragraph(str(c), BODY_SM) for c in row])

    cw = col_widths or [CONTENT_W / len(rows[0])] * len(rows[0])
    t = Table(data, colWidths=cw)

    ts = [
        ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
    ]
    if header:
        ts += [
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
            ("FONTNAME",   (0, 0), (-1, 0), "WorkSans-Bold"),
            ("FONTSIZE",   (0, 0), (-1, 0), 8.5),
        ]
        start = 1
    else:
        start = 0

    if stripe:
        for i in range(start, len(data)):
            if i % 2 == (1 if header else 0):
                ts.append(("BACKGROUND", (0, i), (-1, i), LIGHT_BG))

    ts += [
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
    ]
    t.setStyle(TableStyle(ts))
    return t


# ── PAGE 1: Cover ────────────────────────────────────────────────────────────

def page1():
    elems = []

    # ── Hero ──────────────────────────────────────────────────────────────────
    elems.append(Spacer(1, 0.1 * inch))

    # Eyebrow label
    eyebrow = ps("eyebrow", font="Jura-Medium", size=8, color=GOLD, spaceAfter=4, leading=10)
    elems.append(Paragraph("RESEARCH APPLICATION  ·  NYU TANDON SCHOOL OF ENGINEERING", eyebrow))
    elems.append(Spacer(1, 0.06 * inch))

    # Title
    title_style = ps("cover_title", font="BricolageGrotesque-Bold", size=36, color=NAVY,
                     leading=40, spaceAfter=6)
    elems.append(Paragraph("Robin", title_style))

    sub_style = ps("cover_sub", font="WorkSans", size=14, color=SLATE, leading=20, spaceAfter=8)
    elems.append(Paragraph("Salesforce Fabric — A Context-Aware Enterprise Desktop Intelligence Panel", sub_style))

    elems.append(HRule(CONTENT_W, color=NAVY, thickness=1.5, spaceAfter=10))

    # Author row
    author_style = ps("author", font="WorkSans", size=9, color=SLATE, spaceAfter=2)
    elems.append(Paragraph("Lucas Ting  ·  lucasting1220@gmail.com", author_style))
    elems.append(Spacer(1, 0.22 * inch))

    # Executive summary
    elems.append(Paragraph("Project Overview", H3))
    elems.append(Spacer(1, 0.04 * inch))
    summary = (
        "Robin is a frameless Electron desktop panel that floats above any application and surfaces "
        "Sales Cloud intelligence — opportunity data, Einstein scores, contact engagement, forecasting, "
        "and connected source activity — the moment a client is detected in a simulated Gmail or FinanceOS "
        "environment. The application demonstrates a production-grade architecture bridging a browser-based "
        "simulation layer with a native Electron renderer via WebSocket, serving three distinct enterprise "
        "domains: CRM/Sales, Healthcare, and Retail. Built across approximately 4,500 lines of TypeScript "
        "and React, Robin represents a complete end-to-end prototype of a context-aware enterprise "
        "intelligence overlay."
    )
    body_just = ps("body_j", size=9.2, leading=15, spaceAfter=8, color=colors.HexColor("#2c3a4a"),
                   alignment=TA_JUSTIFY)
    elems.append(Paragraph(summary, body_just))
    elems.append(Spacer(1, 0.18 * inch))

    # ── Architecture summary strip ─────────────────────────────────────────────
    elems.append(Paragraph("High-Level Architecture", H3))
    elems.append(Spacer(1, 0.06 * inch))

    arch_data = [
        [
            Paragraph("Browser Layer", H4),
            Paragraph("", H4),
            Paragraph("WebSocket Bridge", H4),
            Paragraph("", H4),
            Paragraph("Electron Panel", H4),
        ],
        [
            Paragraph("Vite + React (localhost:5173)\nSimulatedGmail · FinanceOS tabs\nfabricBridge.ts singleton", BODY_SM),
            Paragraph("→\nWS :9001\nJSON protocol", ps("arr", font="GeistMono", size=8, color=GOLD,
                      alignment=TA_CENTER, leading=13)),
            Paragraph("ws ^8.20.0\nWebSocketServer\nmain.cjs", BODY_SM),
            Paragraph("→\nIPC\nevents", ps("arr2", font="GeistMono", size=8, color=GOLD,
                      alignment=TA_CENTER, leading=13)),
            Paragraph("Frameless BrowserWindow\nFabricPanel (3 domains)\npreload-fabric.cjs bridge", BODY_SM),
        ],
    ]
    col_w = [CONTENT_W * 0.30, CONTENT_W * 0.10, CONTENT_W * 0.22, CONTENT_W * 0.10, CONTENT_W * 0.28]
    arch_t = Table(arch_data, colWidths=col_w)
    arch_t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BG),
        ("BACKGROUND", (4, 0), (4, -1), LIGHT_BG),
        ("BOX", (0, 0), (0, -1), 0.8, NAVY),
        ("BOX", (2, 0), (2, -1), 0.8, NAVY),
        ("BOX", (4, 0), (4, -1), 0.8, NAVY),
        ("FONTNAME", (0, 0), (-1, 0), "WorkSans-Bold"),
    ]))
    elems.append(arch_t)
    elems.append(Spacer(1, 0.2 * inch))

    # ── Demo links box ─────────────────────────────────────────────────────────
    demo_data = [
        [
            Paragraph("Live Demo", H4),
            Paragraph("Slide Deck", H4),
        ],
        [
            Paragraph("salesforceapp.vercel.app", ps("link", font="GeistMono", size=8.5, color=NAVY_MID, spaceAfter=2)),
            Paragraph("robinslidedeck.vercel.app", ps("link2", font="GeistMono", size=8.5, color=NAVY_MID, spaceAfter=2)),
        ],
        [
            Paragraph("Interactive Electron panel demo running\nin the browser via Vercel deployment", BODY_SM),
            Paragraph("Presentation slides covering product vision,\narchitecture, and design rationale", BODY_SM),
        ],
    ]
    demo_t = Table(demo_data, colWidths=[CONTENT_W * 0.48, CONTENT_W * 0.48],
                   hAlign="CENTER")
    demo_t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
        ("FONTNAME",   (0, 0), (-1, 0), "WorkSans-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 9),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 0.8, NAVY),
        ("LINEAFTER", (0, 0), (0, -1), 0.5, RULE),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
    ]))
    elems.append(demo_t)

    return elems


# ── PAGE 2: System Architecture ──────────────────────────────────────────────

class ArchDiagram(Flowable):
    """Hand-drawn architecture diagram."""
    def __init__(self, width, height):
        Flowable.__init__(self)
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height

        def box(x, y, bw, bh, label, sublabel=None, fill=LIGHT_BG, border=NAVY, label_color=NAVY):
            c.setFillColor(fill)
            c.setStrokeColor(border)
            c.setLineWidth(1.0)
            c.roundRect(x, y, bw, bh, 4, fill=1, stroke=1)
            c.setFillColor(label_color)
            c.setFont("BricolageGrotesque-Bold", 9)
            c.drawCentredString(x + bw / 2, y + bh - 14, label)
            if sublabel:
                c.setFont("WorkSans", 7.5)
                c.setFillColor(SLATE)
                lines = sublabel.split("\n")
                for i, line in enumerate(lines):
                    c.drawCentredString(x + bw / 2, y + bh - 26 - i * 11, line)

        def arrow(x1, y1, x2, y2, label="", color=NAVY):
            c.setStrokeColor(color)
            c.setLineWidth(1.2)
            c.line(x1, y1, x2, y2)
            # arrowhead
            import math
            dx, dy = x2 - x1, y2 - y1
            length = math.sqrt(dx*dx + dy*dy)
            if length == 0: return
            ux, uy = dx/length, dy/length
            size = 6
            c.setFillColor(color)
            p = c.beginPath()
            p.moveTo(x2, y2)
            p.lineTo(x2 - size*ux + size*0.4*uy, y2 - size*uy - size*0.4*ux)
            p.lineTo(x2 - size*ux - size*0.4*uy, y2 - size*uy + size*0.4*ux)
            p.close()
            c.drawPath(p, fill=1, stroke=0)
            if label:
                mx, my = (x1+x2)/2, (y1+y2)/2
                c.setFillColor(SLATE)
                c.setFont("GeistMono", 7)
                c.drawCentredString(mx, my + 4, label)

        # ── Layout ──────────────────────────────────────────────────────────
        # Row 1: Browser | Electron Main
        # Row 2: (space) | Fabric Renderer
        # preload bridge: Electron Main ↔ Fabric Renderer (right side)

        bx, bmw = 0.01*w, 0.42*w        # browser box x, max width
        ex, emw = 0.56*w, 0.44*w        # electron main x, max width
        top_y   = h - 1.0*inch
        mid_y   = h - 2.55*inch
        bot_y   = h - 4.15*inch

        # Browser layer
        box(bx, top_y, bmw, 1.05*inch,
            "Browser Layer",
            "localhost:5173  ·  Vite + React\nSimulatedGmail tab  |  FinanceOS tab\nfabricBridge.ts  WebSocket singleton",
            fill=colors.HexColor("#edf2fb"), border=NAVY_MID)

        # Electron Main
        box(ex, top_y, emw, 1.05*inch,
            "Electron Main Process",
            "main.cjs  ·  Node.js runtime\nWebSocketServer :9001  |  BrowserWindow lifecycle\nGlobal shortcut Cmd+E  |  IPC channels",
            fill=colors.HexColor("#edf2fb"), border=NAVY)

        # Horizontal arrow: Browser → Electron Main
        arrow(bx + bmw, top_y + 0.53*inch,
              ex, top_y + 0.53*inch,
              "WS :9001  JSON protocol", color=NAVY)

        # Fabric Renderer (below Electron Main)
        box(ex, bot_y, emw, 1.05*inch,
            "Fabric Renderer",
            "FabricWindow.tsx  ·  React 18\nOnboarding gate  |  Settings router\nFabricPanel.tsx — 3 domain views",
            fill=colors.HexColor("#f0f5f0"), border=colors.HexColor("#2a6a4a"))

        # Vertical arrow: Electron Main → Fabric Renderer
        arrow(ex + emw * 0.5, top_y,
              ex + emw * 0.5, bot_y + 1.05*inch,
              "IPC  load-client event", color=NAVY)

        # preload-fabric.cjs (bridge, shown as small label box on right edge)
        px = ex + emw - 0.01
        py_mid = (top_y + bot_y + 1.05*inch) / 2
        c.setFillColor(colors.HexColor("#fff8e8"))
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.8)
        c.roundRect(px - 1.1*inch, py_mid - 0.17*inch, 1.1*inch, 0.34*inch, 3, fill=1, stroke=1)
        c.setFillColor(GOLD)
        c.setFont("GeistMono", 7)
        c.drawCentredString(px - 0.55*inch, py_mid + 0.03*inch, "preload-fabric.cjs")
        c.setFont("Jura", 6.8)
        c.setFillColor(SLATE)
        c.drawCentredString(px - 0.55*inch, py_mid - 0.08*inch, "contextBridge / window.fabricAPI")

        # Dashed lines from preload box to Electron Main and Fabric Renderer
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.7)
        c.setDash([3, 3])
        c.line(px - 0.55*inch, py_mid + 0.17*inch, px - 0.55*inch, top_y)
        c.line(px - 0.55*inch, py_mid - 0.17*inch, px - 0.55*inch, bot_y + 1.05*inch)
        c.setDash([])

        # ── Bottom callout bar ───────────────────────────────────────────────
        cy = 0.04*inch
        bar_h = 0.62*inch
        col = CONTENT_W / 3
        labels = [
            ("No-Focus-Steal", "showInactive() — panel appears without\nstealing keyboard focus from user"),
            ("Always-On-Top", "setAlwaysOnTop('screen-saver') renders\nabove full-screen applications"),
            ("Auto-Reconnect", "fabricBridge.ts retries every 2s\nif WebSocket connection drops"),
        ]
        for i, (title, desc) in enumerate(labels):
            x0 = i * col
            c.setFillColor(NAVY if i == 1 else LIGHT_BG)
            c.setStrokeColor(RULE)
            c.setLineWidth(0.5)
            c.roundRect(x0, cy, col - 4, bar_h, 3, fill=1, stroke=1)
            c.setFillColor(WHITE if i == 1 else NAVY)
            c.setFont("WorkSans-Bold", 8)
            c.drawCentredString(x0 + col/2 - 2, cy + bar_h - 15, title)
            c.setFillColor(WHITE if i == 1 else SLATE)
            c.setFont("WorkSans", 7)
            for j, line in enumerate(desc.split("\n")):
                c.drawCentredString(x0 + col/2 - 2, cy + bar_h - 28 - j * 10, line)


def page2():
    elems = []
    elems += section_header("System Architecture",
                            "Cross-process communication via WebSocket and Electron IPC")
    elems.append(Spacer(1, 0.06 * inch))
    diag_h = 4.5 * inch
    elems.append(ArchDiagram(CONTENT_W, diag_h))
    elems.append(Spacer(1, 0.14 * inch))

    elems.append(Paragraph("Source File Map", H3))
    elems.append(Spacer(1, 0.04 * inch))
    file_rows = [
        ("electron/main.cjs",        "Electron main: WebSocket server, BrowserWindow, IPC, Cmd+E shortcut"),
        ("electron/preload-fabric.cjs", "contextBridge exposing window.fabricAPI to the Fabric renderer"),
        ("src/pages/FabricWindow.tsx",  "Fabric panel entry: onboarding gate, settings routing"),
        ("src/components/FabricPanel.tsx", "Main panel UI: 1,197 lines, 3 domain views, Framer Motion animations"),
        ("src/lib/fabricBridge.ts",   "WebSocket client singleton with auto-reconnect (2s interval)"),
        ("src/lib/generateBrief.ts",  "Context-aware brief generation (template-based per client + app)"),
        ("src/data/mockData.ts",      "894-line typed schema: Sales, Healthcare, Retail mock datasets"),
        ("src/pages/Onboarding.tsx",  "4-step state machine: email → connect → syncing → done"),
    ]
    cw = [CONTENT_W * 0.35, CONTENT_W * 0.65]
    rows_p = [[Paragraph(f, ps("mono_f", font="GeistMono", size=7.8, color=NAVY_MID, spaceAfter=0)),
               Paragraph(d, BODY_SM)] for f, d in file_rows]
    t = Table([[Paragraph("File", H4), Paragraph("Role", H4)]] + rows_p, colWidths=cw)
    t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
        ("FONTNAME",   (0, 0), (-1, 0), "WorkSans-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 8.5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
        ("BACKGROUND", (0, 2), (-1, 2), LIGHT_BG),
        ("BACKGROUND", (0, 4), (-1, 4), LIGHT_BG),
        ("BACKGROUND", (0, 6), (-1, 6), LIGHT_BG),
        ("BACKGROUND", (0, 8), (-1, 8), LIGHT_BG),
    ]))
    elems.append(t)
    return elems


# ── PAGE 3: Data Model ───────────────────────────────────────────────────────

def page3():
    elems = []
    elems += section_header("Multi-Domain Data Model",
                            "894-line TypeScript schema across three enterprise verticals")
    elems.append(Spacer(1, 0.06 * inch))

    col = (CONTENT_W - 8) / 3

    def domain_card(title, fields_text, accounts, border_color=NAVY, header_bg=NAVY):
        rows = [
            [Paragraph(title, ps("dc_title", font="WorkSans-Bold", size=9, color=WHITE, spaceAfter=0))],
            [Paragraph("Schema Fields", ps("dc_lbl", font="Jura-Medium", size=7.2, color=MUTED, spaceAfter=2))],
            [Paragraph(fields_text, ps("dc_f", font="GeistMono", size=6.8, color=colors.HexColor("#2c3a4a"), leading=11, spaceAfter=0))],
            [Paragraph("Mock Data", ps("dc_lbl2", font="Jura-Medium", size=7.2, color=MUTED, spaceAfter=2))],
        ] + [[Paragraph(a, BODY_SM)] for a in accounts]

        t = Table(rows, colWidths=[col - 4])
        ts = [
            ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, 0), header_bg),
            ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#f0f2f5")),
            ("BOX", (0, 0), (-1, -1), 0.8, border_color),
            ("LINEBELOW", (0, 0), (-1, 0), 0.8, border_color),
            ("LINEBELOW", (0, 1), (-1, 1), 0.4, RULE),
            ("LINEBELOW", (0, 2), (-1, 2), 0.4, RULE),
            ("LINEBELOW", (0, 3), (-1, 3), 0.4, RULE),
        ]
        t.setStyle(TableStyle(ts))
        return t

    sales_fields = (
        "opportunity {\n"
        "  name, stage, stageIndex\n"
        "  amount, probability (0-100)\n"
        "  forecastCategory, weightedValue\n"
        "  daysInStage, nextStep\n"
        "}\n"
        "contacts [{ role, engagementScore }]\n"
        "forecast { repQuota, attainment\n"
        "           pipelineCoverage }\n"
        "einsteinScore { score, trend\n"
        "                topFactors[] }\n"
        "pendingAutomation []"
    )
    sales_accts = [
        "Acme Corp — at-risk, 47d to renewal",
        "Globex Industries — healthy, $174k expansion",
        "Initech Solutions — critical, 14d, $31.5k AR",
    ]

    health_fields = (
        "patient {\n"
        "  mrn, riskLevel\n"
        "  conditions[], allergies[]\n"
        "  medications [{ dose, frequency }]\n"
        "  labResults [{ test, value\n"
        "               status, reference }]\n"
        "  careTeam[], alerts[]\n"
        "  billing { claimStatus\n"
        "            priorAuths[] }\n"
        "}"
    )
    health_accts = [
        "Margaret Osei — post-op hip, stable",
        "Carlos Rivera — T2 diabetes, CKD",
        "Helen Park — acute heart failure, critical",
    ]

    retail_fields = (
        "customer {\n"
        "  loyaltyTier, loyaltyPoints\n"
        "  lifetimeValue, totalOrders\n"
        "  segment\n"
        "  orders [{ items, total, status }]\n"
        "  returns[], supportTickets[]\n"
        "  signals[]\n"
        "  recommendedActions[]\n"
        "}"
    )
    retail_accts = [
        "Emma Caldwell — Platinum, $8.2k LTV",
        "Jason Park — Gold, at-risk, 69d gap",
        "Sofia Santos — Silver, new high-growth",
    ]

    cards = Table(
        [[
            domain_card("Sales Cloud (CRM)", sales_fields, sales_accts,
                        border_color=NAVY, header_bg=NAVY),
            Spacer(4, 1),
            domain_card("Healthcare", health_fields, health_accts,
                        border_color=colors.HexColor("#1a5a3a"),
                        header_bg=colors.HexColor("#1a5a3a")),
            Spacer(4, 1),
            domain_card("Retail / E-Commerce", retail_fields, retail_accts,
                        border_color=colors.HexColor("#5a3a1a"),
                        header_bg=colors.HexColor("#5a3a1a")),
        ]],
        colWidths=[col, 4, col, 4, col],
    )
    cards.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
    ]))
    elems.append(cards)
    elems.append(Spacer(1, 0.2 * inch))

    # TypeScript code block
    elems.append(Paragraph("Core TypeScript Interface — SalesCloudData", H3))
    elems.append(Spacer(1, 0.06 * inch))
    code_lines = [
        '<font color="#7dd3b0">interface</font> <font color="#fbbf24">SalesCloudData</font> {',
        '  opportunity: {',
        '    name: <font color="#c4b5fd">string</font>; stage: <font color="#c4b5fd">string</font>; stageIndex: <font color="#c4b5fd">number</font>;',
        '    amount: <font color="#c4b5fd">number</font>;  probability: <font color="#c4b5fd">number</font>;  // 0–100',
        '    forecastCategory: <font color="#fbbf24">"Pipeline"</font> | <font color="#fbbf24">"Best Case"</font> | <font color="#fbbf24">"Commit"</font>;',
        '    weightedValue: <font color="#c4b5fd">number</font>;  daysInStage: <font color="#c4b5fd">number</font>;',
        '  };',
        '  contacts: Array&lt;{ name: <font color="#c4b5fd">string</font>; role: <font color="#c4b5fd">string</font>; engagementScore: <font color="#c4b5fd">number</font> }&gt;;',
        '  forecast: { repQuota: <font color="#c4b5fd">number</font>; quotaAttainment: <font color="#c4b5fd">number</font>; pipelineCoverage: <font color="#c4b5fd">number</font> };',
        '  einsteinScore: { score: <font color="#c4b5fd">number</font>; trend: <font color="#fbbf24">"up"</font> | <font color="#fbbf24">"down"</font> | <font color="#fbbf24">"stable"</font>; topFactors: <font color="#c4b5fd">string</font>[] };',
        '  pendingAutomation: Array&lt;{ task: <font color="#c4b5fd">string</font>; type: <font color="#c4b5fd">string</font>; automated: <font color="#c4b5fd">boolean</font> }&gt;;',
        '}',
    ]
    mono_html = ps("mono_html", font="GeistMono", size=7.8, color=CODE_FG, leading=12.5, spaceAfter=0)
    rows = [[Paragraph(l, mono_html)] for l in code_lines]
    code_t = Table(rows, colWidths=[CONTENT_W - 16])
    code_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CODE_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("TOPPADDING",    (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ("ROUNDEDCORNERS", [4]),
    ]))
    elems.append(code_t)
    return elems


# ── PAGE 4: UI/UX Architecture ───────────────────────────────────────────────

def page4():
    elems = []
    elems += section_header("UI/UX Architecture & Animation System",
                            "FabricPanel.tsx — 1,197 lines, domain-branching render logic")
    elems.append(Spacer(1, 0.06 * inch))

    lw = CONTENT_W * 0.50 - 6
    rw = CONTENT_W * 0.50 - 6

    # Left column: FabricPanel breakdown
    left_items = [
        ("Domain Branching", "activeApp prop switches rendering between Sales Cloud, Healthcare, and Retail views from a single unified component."),
        ("Framer Motion Springs", "All panel animations use spring physics: damping 25, stiffness 200. Child elements stagger at 0.25–0.55s delays for progressive reveal."),
        ("Slide-in Entry", "Panel slides in from x:320 (off-screen right) with opacity fade. Exit reverses the motion symmetrically."),
        ("Global Shortcut Toggle", "Cmd+E (registered in Electron main) toggles compact (380×720px) ↔ expanded (700×780px). Panel repositions after 50ms debounce."),
        ("Onboarding State Machine", "4-step flow: email → connect → syncing → done. AnimatePresence mode='wait' ensures sequential entry/exit — no overlapping transitions."),
        ("Step Transitions", "Each onboarding step slides vertically: 16px y-offset, opacity 0→1. Exit reverses to y:-16."),
    ]
    left_rows = []
    for title, desc in left_items:
        left_rows.append([
            Paragraph(title, H4),
            Paragraph(desc, BODY_SM),
        ])
    left_t = Table(left_rows, colWidths=[lw * 0.36, lw * 0.64])
    left_t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
        ("BACKGROUND", (0, 1), (-1, 1), LIGHT_BG),
        ("BACKGROUND", (0, 3), (-1, 3), LIGHT_BG),
        ("BACKGROUND", (0, 5), (-1, 5), LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
    ]))

    # Right column: tech stack table
    stack = [
        ("Desktop runtime",    "Electron 41"),
        ("Frontend framework", "React 18 + Vite 5"),
        ("Language",           "TypeScript (strict)"),
        ("Animation",          "Framer Motion 11"),
        ("UI primitives",      "Radix UI (30+ components)"),
        ("Styling",            "Tailwind CSS + CVA"),
        ("WebSocket",          "ws ^8.20.0"),
        ("Testing",            "Playwright + Vitest"),
        ("Process mgmt",       "concurrently + wait-on"),
        ("Build",              "SWC (Rust-based transpiler)"),
    ]
    stack_rows = [[Paragraph(l, BODY_SM), Paragraph(v, ps("sv", font="GeistMono", size=7.8, color=NAVY_MID, spaceAfter=0))]
                  for l, v in stack]
    right_t = Table([[Paragraph("Layer", H4), Paragraph("Technology", H4)]] + stack_rows,
                    colWidths=[rw * 0.44, rw * 0.56])
    right_t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
        ("FONTNAME",   (0, 0), (-1, 0), "WorkSans-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 8.5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
        ("BACKGROUND", (0, 2), (-1, 2), LIGHT_BG),
        ("BACKGROUND", (0, 4), (-1, 4), LIGHT_BG),
        ("BACKGROUND", (0, 6), (-1, 6), LIGHT_BG),
        ("BACKGROUND", (0, 8), (-1, 8), LIGHT_BG),
        ("BACKGROUND", (0, 10), (-1, 10), LIGHT_BG),
    ]))

    two_col = Table([[left_t, Spacer(12, 1), right_t]],
                    colWidths=[lw, 12, rw])
    two_col.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    elems.append(two_col)
    elems.append(Spacer(1, 0.2 * inch))

    # WebSocket protocol table
    elems.append(Paragraph("WebSocket Message Protocol", H3))
    elems.append(Spacer(1, 0.06 * inch))

    ws_header = ["Direction", "Message Type", "Payload", "Effect"]
    ws_rows = [
        ("Browser → Electron", "client-detected", "clientId, activeApp", "Shows panel, loads client data via IPC"),
        ("Browser → Electron", "client-cleared",  "—",                  "Hides the panel window"),
        ("Electron → Browser", "fabric-closed",   "—",                  "Browser clears the active contact state"),
    ]
    ws_data = [[Paragraph(h, H4) for h in ws_header]]
    for row in ws_rows:
        ws_data.append([
            Paragraph(row[0], ps("ws_dir", font="GeistMono", size=7.8,
                                 color=NAVY_MID if "Browser →" in row[0] else colors.HexColor("#2a6a4a"),
                                 spaceAfter=0)),
            Paragraph(row[1], ps("ws_type", font="GeistMono-Bold", size=7.8, color=NAVY, spaceAfter=0)),
            Paragraph(row[2], BODY_SM),
            Paragraph(row[3], BODY_SM),
        ])

    ws_cw = [CONTENT_W * 0.24, CONTENT_W * 0.22, CONTENT_W * 0.16, CONTENT_W * 0.38]
    ws_t = Table(ws_data, colWidths=ws_cw)
    ws_t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
        ("FONTNAME",   (0, 0), (-1, 0), "WorkSans-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 8.5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
        ("BACKGROUND", (0, 2), (-1, 2), LIGHT_BG),
    ]))
    elems.append(ws_t)
    return elems


# ── PAGE 5: Research Relevance ───────────────────────────────────────────────

def page5():
    elems = []
    elems += section_header("Research Relevance & Future Directions",
                            "HCI contributions and extension opportunities")
    elems.append(Spacer(1, 0.06 * inch))

    body_just = ps("body_j5", size=9.2, leading=15.5, spaceAfter=10, color=colors.HexColor("#2c3a4a"),
                   alignment=TA_JUSTIFY)
    elems.append(Paragraph(
        "Robin demonstrates a novel interaction paradigm for enterprise knowledge work — a context-aware "
        "intelligence layer that activates at the moment of need without interrupting user workflow. This "
        "pattern is directly relevant to HCI research areas including ambient information display, "
        "attention-aware computing, and cross-application context propagation. The system's architecture "
        "provides a concrete, extensible platform for studying how passive contextual overlays affect "
        "decision quality and cognitive load in high-information-density work environments.",
        body_just,
    ))
    elems.append(Spacer(1, 0.06 * inch))

    # Three contribution boxes
    elems.append(Paragraph("Research Contributions", H3))
    elems.append(Spacer(1, 0.08 * inch))

    col = (CONTENT_W - 8) / 3

    def contrib_card(number, title, body, accent=NAVY):
        rows = [
            [Paragraph(number, ps("cn", font="BricolageGrotesque-Bold", size=20, color=accent,
                                  leading=22, spaceAfter=0))],
            [Paragraph(title, ps("ct", font="WorkSans-Bold", size=9, color=colors.HexColor("#1a2535"),
                                 leading=12, spaceAfter=4))],
            [Paragraph(body, ps("cb", size=8.2, leading=12.5, color=SLATE, spaceAfter=0))],
        ]
        t = Table(rows, colWidths=[col - 8])
        t.setStyle(TableStyle([
            ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (0, 0), 12),
            ("TOPPADDING",    (0, 1), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING",   (0, 0), (-1, -1), 12),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 14),
            ("BOX", (0, 0), (-1, -1), 1.0, accent),
            ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#e0e8f0")),
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ]))
        return t

    c1 = contrib_card("01", "Context Propagation Architecture",
        "The WebSocket bridge between simulated applications and the Electron panel establishes a "
        "lightweight protocol for cross-process context sharing, generalizable to any desktop environment "
        "or OS-level application layer.",
        accent=NAVY)

    c2 = contrib_card("02", "Multi-Domain Adaptive UI",
        "A single panel component dynamically reconfigures for CRM, Healthcare, and Retail domains from a "
        "unified codebase — a design pattern for domain-adaptive enterprise interfaces that minimize "
        "developer overhead while serving diverse information needs.",
        accent=colors.HexColor("#1a5a3a"))

    c3 = contrib_card("03", "Ambient Panel UX",
        "The no-focus-steal, always-on-top panel with global keyboard control demonstrates a 'glanceable "
        "overlay' interaction model. The panel activates passively and retreats without requiring the user "
        "to context-switch between applications.",
        accent=colors.HexColor("#7a4a1a"))

    contrib_row = Table([[c1, Spacer(4, 1), c2, Spacer(4, 1), c3]],
                        colWidths=[col, 4, col, 4, col])
    contrib_row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    elems.append(contrib_row)
    elems.append(Spacer(1, 0.22 * inch))

    # Future directions
    elems.append(Paragraph("Future Directions", H3))
    elems.append(Spacer(1, 0.06 * inch))

    future = [
        ("Claude API Integration",
         "Replace template-based brief generation with live Claude API calls for real contextual "
         "summarization — enabling the panel to adapt to any client data without hardcoded templates."),
        ("OAuth Source Connectors",
         "Implement actual OAuth 2.0 connectors for Gmail, Slack, and Zendesk APIs, replacing the "
         "simulation layer with live data feeds."),
        ("Real Application Monitoring",
         "Extend context detection beyond the browser simulation to real application window monitoring "
         "via macOS Accessibility APIs and Windows UI Automation."),
        ("Cognitive Load Study",
         "Conduct IRB-approved user studies measuring cognitive load reduction, task completion time, "
         "and decision quality vs. traditional CRM tab-switching workflows."),
    ]
    fut_rows = []
    for i, (title, desc) in enumerate(future):
        num = Paragraph(f"{'abcd'[i].upper()}", ps("fn", font="BricolageGrotesque-Bold", size=13,
                                                     color=NAVY, leading=14, spaceAfter=0))
        fut_rows.append([num, Paragraph(title, H4), Paragraph(desc, BODY_SM)])
    fut_t = Table(fut_rows, colWidths=[CONTENT_W * 0.06, CONTENT_W * 0.28, CONTENT_W * 0.66])
    fut_t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
        ("BACKGROUND", (0, 1), (-1, 1), LIGHT_BG),
        ("BACKGROUND", (0, 3), (-1, 3), LIGHT_BG),
    ]))
    elems.append(fut_t)
    elems.append(Spacer(1, 0.2 * inch))

    # Build footer strip
    footer_style = ps("foot", font="GeistMono", size=7.5, color=SLATE, alignment=TA_CENTER, spaceAfter=0)
    footer_rows = [
        [Paragraph("Built with Electron 41 · React 18 · TypeScript · Framer Motion 11 · Vite 5", footer_style)],
        [Paragraph("~4,500 lines across 20+ source files", footer_style)],
        [Spacer(1, 4)],
        [Paragraph("salesforceapp.vercel.app  ·  robinslidedeck.vercel.app",
                   ps("foot_link", font="GeistMono", size=7.8, color=NAVY_MID, alignment=TA_CENTER, spaceAfter=0))],
    ]
    foot_t = Table(footer_rows, colWidths=[CONTENT_W])
    foot_t.setStyle(TableStyle([
        ("ALIGN",  (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
    ]))
    elems.append(foot_t)

    return elems


if __name__ == "__main__":
    build_pdf()
