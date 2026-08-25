window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views["contact-form"] = (function () {
  /**
   * Contact / service booking form.
   *
   * The original build only pretended to send: it showed "Sent!" and threw the
   * message away. This one actually delivers, in one of two ways:
   *
   *   - if Admin → Settings has a form endpoint (Formspree, Basin, Web3Forms,
   *     anything that accepts a JSON POST), the message is posted there;
   *   - otherwise it opens the visitor's mail client with the message pre-filled
   *     and addressed to the company e-mail.
   *
   * The fallback needs no server, which suits a site hosted on GitHub Pages, but
   * it does depend on the visitor having a mail client — so the phone numbers
   * stay prominent either way.
   *
   * The form is cloned once and its fields never rebuilt — sent/sending/error
   * states are applied as direct mutations on the same nodes, since the field
   * set itself never changes shape across a submission.
   */

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const { contacts, settings } = Logi.core.selectors;
  /**
   * @param {{title?: string, messageRows?: number}} [options]
   *        messageRows sizes the message field's starting height — taller on
   *        the Contacts page, where the panel is stretched to match the map
   *        card next to it and a 4-row field left most of that height empty.
   * @returns {HTMLElement}
   */
  function contactForm({ title, messageRows = 4 } = {}) {
    const root = tpl.clone('contact-form');
    const { titleEl, sentNote, form, nameInput, phoneInput, msgInput, errorEl, submitBtn } = tpl.refs(root);

    tpl.toggle(titleEl, !!title);
    if (title) tpl.bind(root, { title });
    msgInput.rows = messageRows;

    tpl.bindAttr(root, { namePh: t('formName'), phonePh: t('formPhone'), msgPh: t('formMsg') });
    tpl.bind(root, { sentText: t('formSent') });

    const values = { name: '', phone: '', msg: '' };
    let sending = false;

    nameInput.addEventListener('input', (event) => { values.name = event.currentTarget.value; });
    phoneInput.addEventListener('input', (event) => { values.phone = event.currentTarget.value; });
    // Grows with the message instead of offering a manual drag handle, so the
    // field never hides the end of what the visitor just typed.
    msgInput.addEventListener('input', (event) => {
      values.msg = event.currentTarget.value;
      event.currentTarget.style.height = 'auto';
      event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
    });

    const setError = (message) => {
      errorEl.textContent = message || '';
      tpl.toggle(errorEl, !!message);
    };

    const setSending = (state) => {
      sending = state;
      submitBtn.disabled = state;
      submitBtn.textContent = state ? t('formSending') : t('formSend');
    };
    setSending(false);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;

      if (!values.name.trim() || !values.phone.trim()) {
        setError(t('formRequired'));
        return;
      }

      setError('');
      setSending(true);

      try {
        await deliver(values);
        form.hidden = true;
        tpl.toggle(sentNote, true);
        setSending(false);
      } catch (err) {
        console.error('[contact-form]', err);
        setSending(false);
        setError(t('formError'));
      }
    });

    return root;
  }

  /**
   * Sends the message, by whichever route is configured.
   * @param {{name: string, phone: string, msg: string}} values
   */
  async function deliver(values) {
    const endpoint = settings().formEndpoint?.trim();

    if (endpoint) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          message: values.msg,
          page: window.location.href,
        }),
      });
      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
      return;
    }

    // No endpoint configured: hand the message to the visitor's mail client.
    const email = contacts().email;
    if (!email) throw new Error('No form endpoint and no contact e-mail configured.');

    const subject = `Website enquiry — ${values.name}`;
    const body = [
      `${t('formName')}: ${values.name}`,
      `${t('formPhone')}: ${values.phone}`,
      '',
      values.msg,
    ].join('\n');

    window.location.href =
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return { contactForm };
})();
