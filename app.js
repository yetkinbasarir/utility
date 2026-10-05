let data = [];
let category = "Dosyalar";

const list = document.querySelector("#list");
const cats = document.querySelector("#cats");
const sectionTitle = document.querySelector("#section-title");

fetch("data/commands.json")
  .then(r => r.json())
  .then(d => {
    data = d;
    if (!data.some(x => x.category === category)) category = data[0]?.category || "";
    renderCategories();
    renderCommands();
  });

function renderCategories() {
  cats.innerHTML = "";
  const categories = [...new Set(data.map(x => x.category))];

  categories.forEach(name => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = name;
    b.className = name === category ? "active" : "";
    b.setAttribute("aria-pressed", name === category ? "true" : "false");

    b.addEventListener("click", () => {
      category = name;
      renderCategories();
      renderCommands();
      document.querySelector("#content").scrollIntoView({behavior:"smooth", block:"start"});
    });

    cats.appendChild(b);
  });
}

function renderCommands() {
  sectionTitle.textContent = category;
  list.innerHTML = "";

  const items = data.filter(x => x.category === category);

  items.forEach(x => {
    const article = document.createElement("article");
    article.className = "command-item";

    const flags = [
      x.sudo ? '<span class="flag">SUDO</span>' : "",
      x.caution ? '<span class="flag">DİKKAT</span>' : ""
    ].join("");

    article.innerHTML = `
      <div class="command-inner">
        <button class="command-head" type="button" aria-expanded="false">
          <span class="command-title">${escapeHTML(x.title)}${flags ? `<span class="flags">${flags}</span>` : ""}</span>
          <span class="command-description">${escapeHTML(x.description || "")}</span>
        </button>
        <div class="command-body">
          <div class="code-row">
            <code></code>
            <button class="copy" type="button">KOPYALA</button>
          </div>
          ${x.note ? `<p class="note">${escapeHTML(x.note)}</p>` : ""}
        </div>
      </div>
    `;

    article.querySelector("code").textContent = x.command;

    const head = article.querySelector(".command-head");
    head.addEventListener("click", () => {
      const wasOpen = article.classList.contains("open");

      list.querySelectorAll(".command-item.open").forEach(item => {
        item.classList.remove("open");
        item.querySelector(".command-head")?.setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        article.classList.add("open");
        head.setAttribute("aria-expanded", "true");
      }
    });

    const copy = article.querySelector(".copy");
    copy.addEventListener("click", async e => {
      e.stopPropagation();
      await navigator.clipboard.writeText(x.command);
      copy.textContent = "KOPYALANDI";
      setTimeout(() => copy.textContent = "KOPYALA", 1100);
    });

    list.appendChild(article);
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
