/* MediSphere Core Utilities */
export const MediUtils = {
  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return num.toLocaleString();
    return num.toString();
  },

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  },

  formatDateTime(dateString?: string): string {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year}, ${time}`;
  },

  generateId(prefix = 'ID'): string {
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  },

  generateJWTToken(user: { id: string; name: string; role: string; email: string }): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (86400 * 7) // 7 days
    }));
    const signature = btoa('medisphere_secret_key_2026');
    return `${header}.${payload}.${signature}`;
  },

  parseJWTToken(token: string): any {
    try {
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch (e) {
      return null;
    }
  },

  exportToCSV(filename: string, rows: Record<string, any>[]): void {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  downloadSimulatedPDF(title: string, contentText: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            .meta { margin-bottom: 30px; font-size: 14px; color: #555; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>MediSphere Enterprise Report - ${title}</h1>
          <div class="meta">Generated on: ${new Date().toLocaleString()} | Hospital Network: MediSphere Central</div>
          <div class="box">${contentText}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

if (typeof window !== 'undefined') {
  (window as any).MediUtils = MediUtils;
}
