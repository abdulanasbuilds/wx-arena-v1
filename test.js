fetch("http://localhost:3001/api/health/")
  .then(r => r.text())
  .then(text => console.log("RESULT:", text))
  .catch(err => console.error("ERROR:", err));
