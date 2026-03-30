/* ── Jarda — KSH Partners chatbot ────────────────────────────── */
(function () {

  const FORMSPREE_URL = 'https://formspree.io/f/mnjgdwal';

  /* ── FAQ odpovědi ───────────────────────────────────────────── */
  const FAQ = [
    {
      patterns: [/kolik stoj|cena|cen(í|i)k|kolik to vyjde|co to stoj/i],
      answer: 'Ceny jsou vždy na míru. Základní firemní web začíná orientačně od <b>15 000 Kč</b>, složitější aplikace výše.\n\nChcete nezávaznou nabídku? Pomůžu vám ji sestavit — stačí pár otázek.'
    },
    {
      patterns: [/jak dlouho|za jak dlouho|termín|do(d|t)ání|kdy bude/i],
      answer: 'Standardní web dodáváme <b>do 3 týdnů</b> od schválení podkladů. Složitější projekty trvají déle — domluvíme se předem.'
    },
    {
      patterns: [/online editor|sám upravit|editovat obsah|cms|edit/i],
      answer: 'Ano! Každý web stavíme tak, aby ho klient <b>mohl sám upravovat</b> — texty, obrázky, ceny — bez znalosti kódu a bez volání webmastera.'
    },
    {
      patterns: [/e.?shop|online obchod|prodej online/i],
      answer: 'Ano, e-shopy děláme. Platební brána (Stripe, GoPay, Comgate), správa objednávek i sklad. Chcete nezávaznou poptávku?'
    },
    {
      patterns: [/aplikac|software|systém na míru|rezerva/i],
      answer: 'Aplikace na míru jsou naše silná stránka — rezervační systémy, pokladní systémy, interní nástroje nebo zákaznické portály.'
    },
    {
      patterns: [/kde síd|kde jste|odkud jste|jižní čechy/i],
      answer: 'Sídlíme v jižních Čechách, pracujeme online — vzdálenost nehraje roli. Projekty děláme pro firmy z celé ČR.'
    },
    {
      patterns: [/kontakt|email|telefon|napsat|zavolat/i],
      answer: '📧 <a href="mailto:info@ksh-partners.cz">info@ksh-partners.cz</a>\n📞 <a href="tel:+420774982675">+420 774 982 675</a>\n\nNebo mi řekněte co potřebujete a poptávku odešlu za vás.'
    },
    {
      patterns: [/reference|ukázka|portfolio|projekty|co jste dělali/i],
      answer: '• <b>KraKrám</b> — 2 kamenné prodejny (Tábor + J. Hradec)\n• <b>Rezervační systém</b> pro lyžařskou školu\n• <b>Rezervační systém</b> pro autocamp\n• Firemní weby pro specializované prodejny\n\nDetaily najdete v <a href="#reference" onclick="closeChatbot()">sekci Reference →</a>'
    },
    {
      patterns: [/díky|děkuji|děkuju|super|perfekt/i],
      answer: 'Rádo se stalo! Pokud budete mít další otázky, jsem tu. 😊'
    }
  ];

  /* ── Stav konverzace ────────────────────────────────────────── */
  let state = 'idle';
  let lead  = { need: '', detail: '', name: '', email: '' };

  /* ── CSS ────────────────────────────────────────────────────── */
  const css = `
    #ksh-chat-btn {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 9000;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #F07070, #d44d4d);
      box-shadow: 0 4px 20px rgba(0,0,0,.25);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #ksh-chat-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,.32); }

    #ksh-chat-box {
      position: fixed; bottom: 5.5rem; right: 2rem; z-index: 9000;
      width: 340px; max-width: calc(100vw - 2rem);
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,.18);
      display: none; flex-direction: column; overflow: hidden;
      font-family: 'Inter', system-ui, sans-serif;
    }
    #ksh-chat-box.open { display: flex; animation: chatIn .22s ease; }
    @keyframes chatIn {
      from { opacity: 0; transform: translateY(12px) scale(.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    #ksh-chat-head {
      background: linear-gradient(135deg, #1a1a1a, #333);
      padding: 1rem 1.2rem;
      display: flex; align-items: center; gap: .75rem;
    }
    .ksh-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,.15);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-size: 1rem;
    }
    .ksh-head-info { flex: 1; }
    .ksh-head-info .name { color: #fff; font-weight: 700; font-size: .9rem; }
    .ksh-head-info .status { color: rgba(255,255,255,.55); font-size: .75rem; }
    #ksh-chat-close {
      background: none; border: none; cursor: pointer; color: rgba(255,255,255,.55);
      padding: .2rem; font-size: 1.1rem; line-height: 1; transition: color .15s;
    }
    #ksh-chat-close:hover { color: #fff; }

    #ksh-chat-msgs {
      flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column;
      gap: .75rem; max-height: 320px; scroll-behavior: smooth;
    }
    .msg { max-width: 86%; line-height: 1.55; font-size: .875rem; animation: msgIn .18s ease; }
    @keyframes msgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    .msg.bot {
      background: #fef0f0; color: #1a1a1a;
      border-radius: 4px 12px 12px 12px;
      padding: .65rem .9rem; align-self: flex-start;
    }
    .msg.bot a { color: #F07070; font-weight: 600; }
    .msg.user {
      background: linear-gradient(135deg, #F07070, #d44d4d);
      color: #fff; border-radius: 12px 4px 12px 12px;
      padding: .65rem .9rem; align-self: flex-end;
    }
    .msg.typing { opacity: .55; font-size: 1.1rem; letter-spacing: .1em; }

    .ksh-chips {
      display: flex; flex-wrap: wrap; gap: .4rem;
      padding: 0 1rem .75rem;
    }
    .ksh-chip {
      background: #fef0f0; border: 1px solid #f5d0d0; border-radius: 20px;
      padding: .32rem .8rem; font-size: .78rem; color: #c44040;
      cursor: pointer; font-family: inherit; transition: background .15s;
    }
    .ksh-chip:hover { background: #fcd8d8; }

    #ksh-chat-footer {
      padding: .75rem 1rem; border-top: 1px solid #f0e4e4;
      display: flex; gap: .5rem;
    }
    #ksh-chat-input {
      flex: 1; border: 1.5px solid #f0d0d0; border-radius: 8px;
      padding: .55rem .8rem; font-size: .875rem; outline: none;
      font-family: inherit; transition: border-color .15s;
    }
    #ksh-chat-input:focus { border-color: #F07070; }
    #ksh-chat-send {
      background: linear-gradient(135deg, #F07070, #d44d4d);
      border: none; border-radius: 8px; cursor: pointer;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity .15s;
    }
    #ksh-chat-send:hover { opacity: .85; }
    #ksh-chat-send svg { color: #fff; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="ksh-chat-btn" aria-label="Chat s Jardou">
      <svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    </button>
    <div id="ksh-chat-box" role="dialog" aria-label="Chat s Jardou">
      <div id="ksh-chat-head">
        <div class="ksh-avatar">🤵</div>
        <div class="ksh-head-info">
          <div class="name">Jarda</div>
          <div class="status">Asistent KSH Partners · online</div>
        </div>
        <button id="ksh-chat-close" aria-label="Zavřít">✕</button>
      </div>
      <div id="ksh-chat-msgs"></div>
      <div class="ksh-chips" id="ksh-chips"></div>
      <div id="ksh-chat-footer">
        <input id="ksh-chat-input" type="text" placeholder="Napište zprávu…" autocomplete="off" maxlength="300">
        <button id="ksh-chat-send" aria-label="Odeslat">
          <svg width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  const btn   = document.getElementById('ksh-chat-btn');
  const box   = document.getElementById('ksh-chat-box');
  const msgs  = document.getElementById('ksh-chat-msgs');
  const input = document.getElementById('ksh-chat-input');
  const chips = document.getElementById('ksh-chips');
  let opened  = false;

  /* ── Helpers ─────────────────────────────────────────────────── */
  function addMsg(html, role) {
    const d = document.createElement('div');
    d.className = 'msg ' + role;
    d.innerHTML = html.replace(/\n/g, '<br>');
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function botSay(html, delay = 700) {
    const t = addMsg('●  ●  ●', 'bot typing');
    return new Promise(res => setTimeout(() => {
      t.remove();
      addMsg(html, 'bot');
      res();
    }, delay));
  }

  function setChips(labels, onClick) {
    chips.innerHTML = '';
    labels.forEach(lbl => {
      const b = document.createElement('button');
      b.className = 'ksh-chip';
      b.textContent = lbl;
      b.onclick = () => { chips.innerHTML = ''; onClick(lbl); };
      chips.appendChild(b);
    });
  }

  function clearChips() { chips.innerHTML = ''; }

  /* ── FAQ lookup ─────────────────────────────────────────────── */
  function faqMatch(text) {
    for (const r of FAQ) {
      if (r.patterns.some(p => p.test(text))) return r.answer;
    }
    return null;
  }

  /* ── Konverzační flow ───────────────────────────────────────── */
  async function handleInput(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    clearChips();
    input.value = '';
    input.placeholder = 'Napište zprávu…';

    if (state === 'idle') {
      const faq = faqMatch(text);
      if (faq) {
        await botSay(faq);
        setChips(['Mám zájem o poptávku', 'Další dotaz'], (c) => {
          if (c === 'Mám zájem o poptávku') startLead();
          else {
            clearChips();
            setChips(['Kolik stojí web?', 'Jak rychle dodáte?', 'Online editor?', 'Kontakt'], (c2) => handleInput(c2));
          }
        });
        return;
      }

      const keywords = /chci|potřebuji|potřebuju|hledám|zajímá mě|mám zájem|chtěl bych|chtěla bych|poptávk/i;
      if (keywords.test(text)) {
        lead.need = text;
        state = 'detail';
        await botSay('Skvělé, rád pomohu! 👋 Řekněte mi ještě něco o webu nebo aplikaci, o kterou máte zájem — co by měl umět, pro koho je, případně máte nějakou inspiraci?', 500);
        input.placeholder = 'Popište projekt blíže…';
        return;
      }

      await botSay('Rozumím. Abych vám mohl pomoct, řekněte mi více — nebo vyberte níže:');
      setChips(['Mám zájem o web', 'Chci aplikaci', 'Kolik stojí web?', 'Kontakt'], (c) => handleInput(c));
      return;
    }

    if (state === 'need') {
      lead.need = text;
      state = 'detail';
      await botSay('Rozumím. Řekněte mi ještě něco o webu nebo aplikaci, o kterou máte zájem — co by měl umět, pro koho je, případně máte nějakou inspiraci?', 500);
      input.placeholder = 'Popište projekt blíže…';
      return;
    }

    if (state === 'detail') {
      lead.detail = text;
      state = 'name';
      await botSay('Skvělé, to mi hodně pomůže! Jak se jmenujete?', 500);
      input.placeholder = 'Vaše jméno…';
      return;
    }

    if (state === 'name') {
      lead.name = text;
      state = 'email';
      await botSay(`Příjemné jméno, ${text.split(' ')[0]}! 😊 Na jaký email vám máme odpovědět?`, 500);
      input.placeholder = 'váš@email.cz';
      return;
    }

    if (state === 'email') {
      if (!/\S+@\S+\.\S+/.test(text)) {
        await botSay('Hmm, tohle nevypadá jako platný email. Zkuste to prosím znovu.', 400);
        return;
      }
      lead.email = text;
      state = 'sending';
      input.placeholder = 'Odesílám…';
      await botSay('Výborně! Odesílám poptávku…', 400);
      await sendLead();
      return;
    }
  }

  async function startLead() {
    state = 'need';
    await botSay('Co přesně potřebujete? Popište nám to klidně volně — web, aplikaci, e-shop nebo cokoliv jiného.');
    input.placeholder = 'Popište váš projekt…';
    input.focus();
  }

  async function sendLead() {
    const body = {
      jmeno: lead.name,
      email: lead.email,
      zprava: lead.need,
      zdroj: 'Jarda chatbot'
    };

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        state = 'done';
        await botSay(`✅ Odesláno! Poptávka od <b>${lead.name}</b> dorazila do KSH Partners. Ozveme se na <b>${lead.email}</b> do 24 hodin.`, 300);
        clearChips();
      } else {
        throw new Error('err');
      }
    } catch {
      state = 'done';
      await botSay(`Poptávku se nepodařilo odeslat automaticky. Prosím napište nám přímo:\n📧 <a href="mailto:info@ksh-partners.cz">info@ksh-partners.cz</a>`, 300);
    }
  }

  /* ── Otevření ────────────────────────────────────────────────── */
  function openChat() {
    box.classList.add('open');
    btn.innerHTML = `<svg width="22" height="22" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
    if (!opened) {
      opened = true;
      setTimeout(async () => {
        await botSay('Dobrý den! Jmenuji se <b>Jarda</b> a jsem asistent KSH Partners. 👋', 400);
        await botSay('Mohu vám poradit se službami, nebo rovnou zpracuji vaši poptávku. Co by se vám hodilo?', 600);
        setChips(['Mám zájem o web', 'Chci aplikaci', 'Kolik stojí web?', 'Jak rychle dodáte?', 'Kontakt'],
          (c) => handleInput(c));
      }, 200);
    }
    setTimeout(() => input.focus(), 300);
  }

  function closeChat() {
    box.classList.remove('open');
    btn.innerHTML = `<svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
  }

  window.closeChatbot = closeChat;

  btn.addEventListener('click', () => box.classList.contains('open') ? closeChat() : openChat());
  document.getElementById('ksh-chat-close').addEventListener('click', closeChat);
  document.getElementById('ksh-chat-send').addEventListener('click', () => handleInput(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleInput(input.value); });

})();
