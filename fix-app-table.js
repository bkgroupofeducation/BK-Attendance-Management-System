const fs = require('fs');

let appFile = 'frontend/src/App.js';
let appContent = fs.readFileSync(appFile, 'utf8');

const tableRegex = /<tbody id="attendanceTable">[\s\S]*?<\/tbody>/;
const dynamicTable = `<tbody id="attendanceTable">
                    {recent.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No attendance records yet today. Waiting for machine sync...</td></tr>
                    ) : recent.map((r, i) => (
                      <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {r.photo ? (
                                <img src={r.photo.startsWith('http') ? r.photo : \`http://\${backendHost}:8080\${r.photo}\`} alt="Face" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div className="avatar" style={{ background: '#bdc3c7' }}>{r.name.charAt(0)}</div>
                              )}
                              {r.name}
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{r.role}</td>
                          <td>{r.inTime}</td>
                          <td>{r.outTime}</td>
                          <td><span className="status present">{r.status}</span></td>
                      </tr>
                    ))}
                </tbody>`;

appContent = appContent.replace(tableRegex, dynamicTable);

appContent = appContent.replace(
  `<span>Showing 5 of 124 entries</span>`,
  `<span>Showing {recent.length} entries</span>`
);

fs.writeFileSync(appFile, appContent);
console.log('Fixed frontend App.js');
