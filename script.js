let englishData = null;

// ---- ANALYSE BUTTON ----
document.getElementById("analyseBtn").addEventListener("click", async function () {
  const fileInput = document.getElementById("pdfInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a PDF file first!");
    return;
  }

  const btn = document.getElementById("analyseBtn");
  btn.textContent = " Analysing...";
  btn.disabled = true;

  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await fetch( "https://legal-document-simplifier-1.onrender.com/analyse" ,{
      method: "POST",
      body: formData
    });

    const data = await response.json();
    englishData = data;
    showResults(data.summary, data.risks);
    setActiveBtn("en");

  } catch (error) {
    alert("Something went wrong! Make sure server is running.");
    console.error(error);
  }

  btn.textContent = "Analyse Document";
  btn.disabled = false;
});

// ---- LANGUAGE FUNCTION (called by onclick in HTML) ----
async function setLang(lang) {
  if (!englishData) return;

  if (lang === "en") {
    showResults(englishData.summary, englishData.risks);
    setActiveBtn("en");
    return;
  }

  try {
    const response = await fetch("http://legal-document-simplifier-lsfx.onrender.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: englishData, lang: lang })
    });
    const translated = await response.json();
    showResults(translated.summary, translated.risks);
    setActiveBtn(lang);
  } catch (error) {
    alert("Translation failed. Try again.");
    console.error(error);
  }
}

// ---- SHOW RESULTS ----
function showResults(summary, risks) {
  // Summary - matches <ul id="summary">
  const summaryEl = document.getElementById("summary");
  summaryEl.innerHTML = summary.map(p => `<li>${p}</li>`).join("");

  // Risks - matches <ul id="risks">
  const risksEl = document.getElementById("risks");
  risksEl.innerHTML = risks.map(r => `<li>⚠ ${r}</li>`).join("");

  // Risk meter
  const meter = document.getElementById("meterFill");
  const label = document.getElementById("riskLabel");
  const count = risks.length;

  if (count <= 1) {
    meter.style.width = "30%";
    meter.style.background = "green";
    label.style.color = "green";
    label.textContent = "Low Risk";
  } else if (count <= 2) {
    meter.style.width = "60%";
    meter.style.background = "orange";
    label.style.color = "orange";
    label.textContent = "Medium Risk";
  } else {
    meter.style.width = "90%";
    meter.style.background = "red";
    label.style.color = "red";
    label.textContent = "High Risk";
  }
}

// ---- ACTIVE BUTTON HIGHLIGHT ----
function setActiveBtn(lang) {
  ["en", "hi", "bn"].forEach(l => {
    const btn = document.getElementById("btn-" + l);
    if (btn) btn.classList.remove("active");
  });
  const active = document.getElementById("btn-" + lang);
  if (active) active.classList.add("active");
}
