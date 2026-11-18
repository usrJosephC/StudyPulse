"""Gera PDFs acadêmicos e HTML editável. Execute a partir de qualquer diretório."""
from pathlib import Path
from datetime import datetime
from html import escape
import re

import markdown
from bs4 import BeautifulSoup, NavigableString
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image

ROOT = Path(__file__).resolve().parent
WIDTH = A4[0] - 5 * cm
FONT = Path('C:/Windows/Fonts')
if (FONT / 'times.ttf').exists():
    for name, filename in [('Academic', 'times.ttf'), ('Academic-Bold', 'timesbd.ttf'), ('Academic-Italic', 'timesi.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(FONT / filename)))
    pdfmetrics.registerFontFamily('Academic', normal='Academic', bold='Academic-Bold', italic='Academic-Italic', boldItalic='Academic-Bold')
    family = 'Academic'
else:
    family = 'Times-Roman'

styles = getSampleStyleSheet()
styles.add(ParagraphStyle('BodyAcademic', fontName=family, fontSize=12, leading=18, spaceAfter=9, alignment=TA_JUSTIFY))
styles.add(ParagraphStyle('CellAcademic', fontName=family, fontSize=10, leading=13, spaceAfter=0))
styles.add(ParagraphStyle('CodeAcademic', fontName='Courier', fontSize=8, leading=11, backColor=colors.HexColor('#f1f3f5'), borderPadding=8, spaceAfter=12))
styles.add(ParagraphStyle('CaptionAcademic', fontName=family, fontSize=10, leading=14, alignment=TA_CENTER, spaceAfter=12))
for name, size in [('Heading1', 14), ('Heading2', 12), ('Heading3', 12)]:
    styles[name].fontName = 'Academic-Bold' if family == 'Academic' else 'Times-Bold'
    styles[name].fontSize = size
    styles[name].leading = size * 1.4
    styles[name].textColor = colors.black
    styles[name].spaceBefore = 14
    styles[name].spaceAfter = 10
styles['Title'].fontName = styles['Heading1'].fontName
styles['Title'].fontSize = 19
styles['Title'].leading = 26
styles['Title'].textColor = colors.black

def inline(node):
    if isinstance(node, NavigableString):
        return escape(str(node))
    text = ''.join(inline(child) for child in node.children)
    if node.name in ('strong', 'b'):
        return f'<b>{text}</b>'
    if node.name in ('em', 'i'):
        return f'<i>{text}</i>'
    if node.name == 'code':
        return f'<font name="Courier" size="9">{text}</font>'
    if node.name == 'br':
        return '<br/>'
    if node.name == 'a' and node.get('href', '').startswith(('http://', 'https://')):
        return f'<a href="{escape(node["href"], quote=True)}" color="#003566">{text}</a>'
    return text

def footer(canvas, doc):
    if doc.page == 1:
        return
    canvas.saveState()
    canvas.setFont(family, 10)
    canvas.drawRightString(A4[0] - 2 * cm, A4[1] - 1.7 * cm, str(doc.page - 1))
    canvas.restoreState()

def cover(title, subtitle):
    return [
        Paragraph('AFYA / UNIMA MACEIÓ', styles['Title']),
        Paragraph('INTERAÇÃO HUMANO-COMPUTADOR', styles['CaptionAcademic']),
        Spacer(1, 2 * cm),
        Paragraph('Joseph Bartholomeu Cavalcante Rocha<br/>Letícya Beatryz dos Santos Medeiros<br/>Mariana Pereira de Melo', styles['CaptionAcademic']),
        Spacer(1, 2 * cm), Paragraph(title, styles['Title']),
        Paragraph(subtitle, styles['CaptionAcademic']), Spacer(1, 2 * cm),
        Paragraph('Prof. Icaro Ferreira<br/>Turma: [PENDENTE]<br/>Entrega prevista: 18 de novembro de 2026', styles['CaptionAcademic']),
        Spacer(1, 2 * cm), Paragraph('Maceió<br/>2026', styles['CaptionAcademic']), PageBreak(),
    ]

def convert(source, target, title, subtitle, figures=False):
    raw = source.read_text(encoding='utf-8')
    raw = re.sub(r'\A---\n.*?\n---\n', '', raw, count=1, flags=re.S)
    # Apêndices usam as mesmas fontes dos PDFs avulsos, evitando divergências.
    def include_appendix(match):
        included = (ROOT / match.group(1)).read_text(encoding='utf-8')
        included = re.sub(r'^# .+\n', '', included, count=1)
        return included
    raw = re.sub(r'<!-- include: (roteiro-testes\.md|casos-testes\.md) -->', include_appendix, raw)
    raw = raw.replace('<!-- pagebreak -->', '<div class="pagebreak"></div>')
    html = markdown.markdown(raw, extensions=['tables', 'fenced_code'])
    css = '@page{size:A4;margin:3cm 2cm 2cm 3cm}body{font:12pt/1.5 "Times New Roman",serif;max-width:900px;margin:auto;padding:20px}h1{font-size:16pt}h2{font-size:13pt}table{border-collapse:collapse;width:100%;font-size:10pt}td,th{border:1px solid #aaa;padding:6px;vertical-align:top}pre{white-space:pre-wrap;font-size:9pt;background:#eee;padding:12px}.pagebreak{break-before:page}'
    source.with_suffix('.html').write_text(f'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>{escape(title)}</title><style>{css}</style><body>{html}</body></html>', encoding='utf-8')
    story = cover(title, subtitle)
    soup = BeautifulSoup(html, 'html.parser')
    for el in soup.children:
        if not getattr(el, 'name', None):
            continue
        if el.name == 'div' and 'pagebreak' in el.get('class', []):
            story.append(PageBreak())
        elif el.name in ('h1', 'h2', 'h3'):
            story.append(Paragraph(inline(el), styles[{'h1':'Heading1','h2':'Heading2','h3':'Heading3'}[el.name]]))
        elif el.name in ('p', 'blockquote'):
            story.append(Paragraph(inline(el), styles['BodyAcademic']))
        elif el.name in ('ul', 'ol'):
            for i, item in enumerate(el.find_all('li', recursive=False), 1):
                prefix = f'{i}. ' if el.name == 'ol' else '- '
                story.append(Paragraph(prefix + inline(item), styles['BodyAcademic']))
        elif el.name == 'pre':
            # Wrap snippets deliberately: long source paths must not leave the page.
            code = escape(el.get_text()).replace(' ', '&#160;').replace('\n', '<br/>')
            story.append(Paragraph(code, styles['CodeAcademic']))
        elif el.name == 'table':
            rows = [[Paragraph(inline(cell), styles['CellAcademic']) for cell in row.find_all(['td', 'th'])] for row in el.find_all('tr')]
            n = len(rows[0])
            weights = [0.27, 0.73] if n == 2 else [1/n] * n
            table = Table(rows, colWidths=[WIDTH*w for w in weights], repeatRows=1, hAlign='LEFT')
            table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'), ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e9edf2')),
                ('GRID', (0,0), (-1,-1), .4, colors.HexColor('#aab2bd')),
                ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
                ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
            ]))
            story.extend([table, Spacer(1,12)])
    if figures:
        for number, path in enumerate(sorted((ROOT/'evidencias'/'tecnicas').glob('*.png')), 1):
            story.append(PageBreak())
            story.append(Paragraph(f'EVIDÊNCIA TÉCNICA {number}', styles['Heading1']))
            story.append(Paragraph(path.stem.replace('-', ' '), styles['CaptionAcademic']))
            image = Image(str(path))
            factor = min(WIDTH/image.imageWidth, 17*cm/image.imageHeight)
            image.drawWidth = image.imageWidth * factor
            image.drawHeight = image.imageHeight * factor
            story.append(image)
            story.append(Spacer(1,12))
            captured = datetime.fromtimestamp(path.stat().st_mtime).strftime('%d/%m/%Y')
            story.append(Paragraph(f'Fonte: captura técnica da equipe, {captured}, conta local de demonstração. Não corresponde a uma sessão externa P1/P2.', styles['CaptionAcademic']))
    doc = SimpleDocTemplate(str(target), pagesize=A4, rightMargin=2*cm, leftMargin=3*cm, topMargin=3*cm, bottomMargin=2*cm, title=title, author='Equipe StudyPulse')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(target)

if __name__ == '__main__':
    convert(ROOT/'relatorio.md', ROOT/'RelatorioIHC_StudyPulse.pdf', 'StudyPulse', 'Interface, animação e experiência', figures=True)
    convert(ROOT/'roteiro-testes.md', ROOT/'RoteiroTestes_StudyPulse.pdf', 'StudyPulse', 'Roteiro de testes com participantes externos')
    if (ROOT/'casos-testes.md').exists():
        convert(ROOT/'casos-testes.md', ROOT/'CasosTestes_StudyPulse.pdf', 'StudyPulse', 'Casos de teste para validação interna')
