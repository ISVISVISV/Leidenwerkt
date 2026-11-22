// Licht of donker, als iemand dat eerder koos. Vóór het tekenen van de pagina, zodat er niets verspringt.
try {
  var t = localStorage.getItem("thema");
  if (t === "licht" || t === "donker") document.documentElement.dataset.thema = t;
} catch (e) {}
