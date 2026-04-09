export function generatePatientCode() {
  const stamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `PT-${stamp}${random}`;
}
