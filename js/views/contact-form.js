window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views["contact-form"] = (function () {

  const tpl = Logi.core.tpl;
  const { t } = Logi.core.i18n;
  const { contacts, settings } = Logi.core.selectors;
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
