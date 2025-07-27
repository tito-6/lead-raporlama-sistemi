import React from 'react';

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '24px 0',
  fontSize: '14px',
};
const thStyle = {
  background: '#0066A1',
  color: 'white',
  padding: '8px',
  border: '1px solid #ddd',
};
const tdStyle = {
  padding: '8px',
  border: '1px solid #ddd',
};
const sectionHeader = {
  fontSize: '18px',
  fontWeight: 700,
  margin: '32px 0 8px 0',
  color: '#0066A1',
};

const ReportTemplate = ({
  projectName = 'Tümü',
  salesRep = 'Tümü',
  dateRange = '- - -',
  leadType,
  status = [],
  projects = [],
  personnel = [],
  // chart SVGs as React nodes (optional)
  statusChart,
  projectChart,
  personnelChart,
}) => (
  <html lang="tr">
    <head>
      <meta charSet="utf-8" />
      <title>Leads Statistics Report</title>
      <style>{`
        body { font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 40px; }
        .logo { width: 120px; margin-bottom: 16px; }
        .meta { margin-bottom: 24px; }
        .meta span { display: inline-block; margin-right: 24px; font-size: 15px; }
        h1 { color: #0066A1; font-size: 28px; margin-bottom: 8px; }
        table tr:nth-child(even) { background: #f6fafd; }
      `}</style>
    </head>
    <body>
      <img src="/innogylogo.png" alt="Logo" className="logo" />
      <h1>Leads Statistics Report</h1>
      <div className="meta">
        <span>Proje: {projectName}</span>
        <span>Personel: {salesRep}</span>
        <span>Tarih: {dateRange}</span>
        {leadType && <span>Lead Tipi: {leadType}</span>}
      </div>
      <div style={sectionHeader}>Durum Dağılımı</div>
      {statusChart && <div>{statusChart}</div>}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Durum</th>
            <th style={thStyle}>Adet</th>
            <th style={thStyle}>%</th>
          </tr>
        </thead>
        <tbody>
          {status.map((row, i) => (
            <tr key={i}>
              <td style={tdStyle}>{row.name}</td>
              <td style={tdStyle}>{row.count}</td>
              <td style={tdStyle}>{row.percent}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={sectionHeader}>Proje Dağılımı</div>
      {projectChart && <div>{projectChart}</div>}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Proje</th>
            <th style={thStyle}>Adet</th>
            <th style={thStyle}>%</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((row, i) => (
            <tr key={i}>
              <td style={tdStyle}>{row.name}</td>
              <td style={tdStyle}>{row.count}</td>
              <td style={tdStyle}>{row.percent}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={sectionHeader}>Personel Dağılımı</div>
      {personnelChart && <div>{personnelChart}</div>}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Personel</th>
            <th style={thStyle}>Adet</th>
            <th style={thStyle}>%</th>
          </tr>
        </thead>
        <tbody>
          {personnel.map((row, i) => (
            <tr key={i}>
              <td style={tdStyle}>{row.name}</td>
              <td style={tdStyle}>{row.count}</td>
              <td style={tdStyle}>{row.percent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </body>
  </html>
);

export default ReportTemplate; 