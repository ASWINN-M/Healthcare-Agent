async function analyze() {
  const symptoms = document.getElementById("symptoms").value;

  const response = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms })
  });

  const data = await response.json();
  document.getElementById("output").innerHTML =
    `<h3>Risk:</h3> ${data.risk.risk_level}
     <h3>Advice:</h3> ${data.risk.advice}
     <h3>AI Response:</h3> ${data.ai}`;
}
